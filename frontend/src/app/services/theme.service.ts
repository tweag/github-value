import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'preferred-theme'; 
  private isDarkThemeSubject = new BehaviorSubject<boolean>(false);
  private themeSubject = new BehaviorSubject<string>('light-theme');

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (!savedTheme || savedTheme === 'system') {
      this.saveThemePreference('system');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkThemeSubject.next(prefersDark);
    } else {
      this.isDarkThemeSubject.next(savedTheme === 'dark-theme');
      this.themeSubject.next(savedTheme);
    }
    this.applyTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (this.themeSubject.value === 'system') {
        this.isDarkThemeSubject.next(e.matches);
        this.applyTheme();
      }
    });
  }

  getTheme(): Observable<string> {
    return this.themeSubject.asObservable();
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

  saveThemePreference(theme: 'light-theme' | 'dark-theme' | 'system'): void {
    if (theme === 'system') {
      this.isDarkThemeSubject.next(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      this.isDarkThemeSubject.next(theme === 'dark-theme');
    }
    this.applyTheme();
    this.themeSubject.next(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  private applyTheme(): void {
    const isDark = this.isDarkThemeSubject.value;
    document.body.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('light-theme', !isDark);

    const theme = isDark ? 'dark-theme' : 'light-theme';
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(theme);
  }
}