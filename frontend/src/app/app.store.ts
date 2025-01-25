import { InjectionToken } from '@angular/core';

import {createStore,Store, compose, StoreEnhancer} from 'redux';

/*
import {
  createStore,
  Store,
  compose,
  StoreEnhancer
} from 'redux';
*/

import { AppState } from './app.state';

import { counterReducer as reducer} from './counter.reducer';


declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

export const AppStore = new InjectionToken('App.store');

/*
const devtools: StoreEnhancer<AppState> =
  window['devToolsExtension'] ?
  window['devToolsExtension']() : f => f;
*/
//const devtools: StoreEnhancer<AppState> =  window.devToolsExtension ? window.devToolsExtension : f=> f;
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export function createAppStore(): Store<AppState> {
  return createStore<AppState>(
    reducer,
    composeEnhancers()
   // compose(devtools)
  );
}

/*
export function createAppStore(): Store<AppState> {
  return createStore<AppState>(
    reducer
  );
}
*/
export const appStoreProviders = [
   { provide: AppStore, useFactory: createAppStore }
];
