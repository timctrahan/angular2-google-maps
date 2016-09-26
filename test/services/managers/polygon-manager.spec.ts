import {NgZone} from '@angular/core';
import {TestBed, inject} from '@angular/core/testing';

import {SebmGoogleMapPolygon} from '../../../src/core/directives/google-map-polygon';
import {GoogleMapsAPIWrapper} from '../../../src/core/services/google-maps-api-wrapper';
import {Polygon} from '../../../src/core/services/google-maps-types';
import {PolygonManager} from '../../../src/core/services/managers/polygon-manager';

export function main() {
  describe('PolygonManager', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: NgZone, useFactory: () => new NgZone({enableLongStackTrace: true})},
          PolygonManager, SebmGoogleMapPolygon, {
            provide: GoogleMapsAPIWrapper,
            useValue: jasmine.createSpyObj('GoogleMapsAPIWrapper', ['createPolygon'])
          }
        ]
      });
    });

    describe('Create a new polygon', () => {
      it('should call the mapsApiWrapper when creating a new polygon',
         inject(
             [PolygonManager, GoogleMapsAPIWrapper],
             (polylineManager: PolygonManager, apiWrapper: GoogleMapsAPIWrapper) => {
               const newPolygon = new SebmGoogleMapPolygon(polylineManager);
               polylineManager.addPolygon(newPolygon);

               expect(apiWrapper.createPolygon).toHaveBeenCalledWith({
                 clickable: true,
                 draggable: false,
                 editable: false,
                 fillColor: undefined,
                 fillOpacity: undefined,
                 geodesic: false,
                 paths: [],
                 strokeColor: undefined,
                 strokeOpacity: undefined,
                 strokeWeight: undefined,
                 visible: undefined,
                 zIndex: undefined
               });
             }));
    });

    describe('Delete a polygon', () => {
      it('should set the map to null when deleting a existing polygon',
         inject(
             [PolygonManager, GoogleMapsAPIWrapper],
             (polylineManager: PolygonManager, apiWrapper: GoogleMapsAPIWrapper) => {
               const newPolygon = new SebmGoogleMapPolygon(polylineManager);

               const polygonInstance: Polygon = jasmine.createSpyObj('Polygon', ['setMap']);
               (<any>apiWrapper.createPolygon).and.returnValue(Promise.resolve(polygonInstance));

               polylineManager.addPolygon(newPolygon);
               polylineManager.deletePolygon(newPolygon).then(() => {
                 expect(polygonInstance.setMap).toHaveBeenCalledWith(null);
               });
             }));
    });
  });
}
