import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'preferred-theme'; 
  private isDarkThemeSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.isDarkThemeSubject.next(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkThemeSubject.next(prefersDark);
    }
    this.applyTheme();
  }

  isDarkTheme(): Observable<boolean> {
    return this.isDarkThemeSubject.asObservable();
  }

  toggleTheme(): void {
    this.isDarkThemeSubject.next(!this.isDarkThemeSubject.value);
    this.applyTheme();
  }

  setDarkTheme(isDark: boolean): void {
    this.isDarkThemeSubject.next(isDark);
    this.applyTheme();
  }

  private applyTheme(): void {
    const isDark = this.isDarkThemeSubject.value;
    document.body.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('light-theme', !isDark);
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');

    const theme = isDark ? 'dark-theme' : 'light-theme';
    document.body.setAttribute('class', theme);
  }
}