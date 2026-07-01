"use client";

import * as React from "react";

/**
 * Tiny external store so `Sidebar` and `Navbar` can share the mobile
 * drawer + desktop-collapse state without needing a context provider
 * wrapped around every page.
 */
interface SidebarState {
  mobileOpen: boolean;
  collapsed: boolean;
}

let state: SidebarState = { mobileOpen: false, collapsed: false };
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot(): SidebarState {
  return { mobileOpen: false, collapsed: false };
}

export function openMobileSidebar() {
  state = { ...state, mobileOpen: true };
  emitChange();
}

export function closeMobileSidebar() {
  state = { ...state, mobileOpen: false };
  emitChange();
}

export function toggleMobileSidebar() {
  state = { ...state, mobileOpen: !state.mobileOpen };
  emitChange();
}

export function setSidebarCollapsed(collapsed: boolean) {
  state = { ...state, collapsed };
  emitChange();
}

export function useSidebarState() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
