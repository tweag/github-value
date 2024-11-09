import Highcharts from 'highcharts/es-modules/masters/highcharts.src';

const tooltipHeaderFormat =
  '<table><tr><th style="color: var(--sys-on-surface-variant); font-weight: 600; padding-bottom: 2px">{point.key}</th></tr>';

const tooltipPointFormat =
  '<tr><td style="padding: 0.25rem;"><span style="color:{point.color}">●</span> {series.name}: <strong>{point.y}</strong></td></tr>';

const tooltipFooterFormat = '</table>';

const xAxisConfig: Highcharts.XAxisOptions = {
  tickWidth: 0,
  lineWidth: 0,
  gridLineColor: 'var(--sys-outline)',
  gridLineDashStyle: 'Dot',
  lineColor: 'var(--sys-outline)',
  labels: {
    style: {
      color: 'var(--sys-on-surface)',
      font: 'var(--sys-body-large)'
    }
  },
  title: {
    style: {
      color: 'var(--sys-on-surface-variant)',
      font: 'var(--sys-body-large)'
    }
  }
};

const yAxisConfig: Highcharts.YAxisOptions = {
  // Same config as xAxis but with YAxis type
  ...xAxisConfig
};

Highcharts.theme = {
  colors: [
    'var(--sys-primary)',
    'var(--sys-secondary)',
    'var(--sys-tertiary)',
    'var(--sys-primary-container)',
    'var(--sys-secondary-container)',
    'var(--sys-tertiary-container)',
    'var(--sys-inverse-primary)',
    'var(--sys-error)',
    'var(--sys-on-error)'
  ],
  chart: {
    backgroundColor: 'var(--sys-surface)',
    style: {
      fontFamily: 'var(--sys-body-large-font)'
    },
    animation: {
      duration: 300
    },
    spacing: [20, 20, 20, 20]
  },
  title: {
    align: 'left',
    style: {
      color: 'var(--sys-on-surface)',
      font: 'var(--sys-headline-small)'
    }
  },
  subtitle: {
    align: 'left',
    style: {
      color: 'var(--sys-on-surface-variant)',
      font: 'var(--sys-title-medium)'
    }
  },
  xAxis: xAxisConfig,
  yAxis: yAxisConfig,
  legend: {
    align: 'left',
    verticalAlign: 'top',
    itemStyle: {
      color: 'var(--sys-on-surface)',
      font: 'var(--sys-body-large)'
    },
    itemHoverStyle: {
      color: 'var(--sys-primary)'
    },
    backgroundColor: 'var(--sys-surface-container)'
  },
  tooltip: {
    backgroundColor: 'var(--sys-surface-container)',
    borderColor: 'var(--sys-outline)',
    borderRadius: 4,
    padding: 8,
    shadow: {
      color: 'var(--sys-shadow)',
      offsetX: 2,
      offsetY: 2,
      opacity: 0.2
    },
    style: {
      color: 'var(--sys-on-surface)',
      font: 'var(--sys-body-medium)',
      fontSize: '14px'
    },
    useHTML: true,
    headerFormat: tooltipHeaderFormat,
    pointFormat: tooltipPointFormat,
    footerFormat: tooltipFooterFormat
  },
  plotOptions: {
    series: {
      animation: {
        duration: 300
      },
      states: {
        hover: {
          brightness: 0.1,
          halo: {
            size: 5,
            opacity: 0.25
          }
        },
        inactive: {
          opacity: 0.5
        }
      }
    },
    column: {
      borderRadius: 4,
      borderWidth: 0
    },
    pie: {
      borderWidth: 0,
      borderRadius: 4
    }
  },
  accessibility: {
    announceNewData: {
      enabled: true
    },
    description: 'Chart showing data visualization'
  },
  navigation: {
    buttonOptions: {
      theme: {
        fill: 'var(--sys-surface-container)',
        stroke: 'var(--sys-outline)',
      }
    }
  },
  credits: {
    enabled: false
  }
};
Highcharts.setOptions(Highcharts.theme);
