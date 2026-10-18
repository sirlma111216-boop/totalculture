import {initialPlaces as seeds,opportunities as offers} from './seed-catalog.mjs';
import type {Place,Opportunity} from './types';
export const initialPlaces=seeds as Place[];
export const opportunities=offers as Opportunity[];
