"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockSeatsGenerator = void 0;
// mockSeatsGenerator.ts
var date_fns_1 = require("date-fns");
var MockSeatsGenerator = /** @class */ (function () {
    function MockSeatsGenerator(config, templateData) {
        var _this = this;
        this.config = config;
        this.baseData = templateData;
        this.activities = new Map();
        this.editors = config.editors;
        // Ensure seats exist in templateData
        if (!this.baseData.seats) {
            throw new Error("Template data must include a 'seats' property.");
        }
        ;
        // Initialize last activity times for all users
        this.baseData.seats.forEach(function (seat) {
            var login = seat.assignee.login;
            var lastActivityAt = seat.last_activity_at;
            // Use lastActivityAt as needed
            _this.activities.set(login, new Date(lastActivityAt));
        });
    }
    MockSeatsGenerator.prototype.getRandomEditor = function () {
        return this.editors[Math.floor(Math.random() * this.editors.length)];
    };
    MockSeatsGenerator.prototype.getNextActivityIncrement = function (login) {
        var isHeavyUser = this.config.heavyUsers.includes(login);
        switch (this.config.usagePattern) {
            case 'heavy':
                return 4; // 4 hours
            case 'heavy-but-siloed':
                return isHeavyUser ? 12 : 24; // 12 hours or 24 hours
            case 'moderate':
                return 24; // 24 hours
            case 'light':
                return 168; // 7 days
        }
    };
    MockSeatsGenerator.prototype.updateActivity = function (login) {
        var currentActivity = this.activities.get(login);
        var incrementHours = this.getNextActivityIncrement(login);
        var newActivity = (0, date_fns_1.addHours)(currentActivity, incrementHours);
        if (newActivity == currentActivity) {
            console.log("No new activity for ".concat(login), newActivity);
        }
        // Don't go beyond end date
        if (newActivity > this.config.endDate) {
            return false;
        }
        return newActivity;
    };
    MockSeatsGenerator.prototype.generateMetrics = function () {
        var _this = this;
        var newData = JSON.parse(JSON.stringify(this.baseData));
        newData.seats = newData.seats.map(function (seat) {
            var login = seat.assignee.login;
            seat.last_activity_editor = _this.getRandomEditor();
            // Update for next time
            seat.last_activity_at = _this.updateActivity(login);
            return seat;
        });
        return newData;
    };
    return MockSeatsGenerator;
}());
exports.MockSeatsGenerator = MockSeatsGenerator;
// // Example usage:
// const mockConfig: SeatsMockConfig = {
//   startDate: new Date('2024-01-01'),
//   endDate: new Date('2024-12-31'),
//   usagePattern: 'moderate',
//   heavyUsers: ['nathos', 'arfon', 'kyanny'],
//   editors: [
//     'copilot-chat-platform',
//     'vscode/1.96.2/copilot/1.254.0',
//     'GitHubGhostPilot/1.0.0/unknown',
//     'vscode/1.96.2/',
//     'vscode/1.97.0-insider/copilot-chat/0.24.2024122001'
//   ]
// };
