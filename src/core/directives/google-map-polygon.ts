import {AfterContentInit, Directive, EventEmitter, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {LatLng, LatLngLiteral, PolyMouseEvent} from '../services/google-maps-types';
import {PolygonManager} from '../services/managers/polygon-manager';

/**
 * SebmGoogleMapPolygon renders a polygon on a {@link SebmGoogleMap}
 *
 * ### Example
 * ```typescript
 * import {Component} from 'angular2/core';
 * import {SebmGoogleMap, SebmGooglePolygon, LatLngLiteral} from 'angular2-maps/core';
 *
 * @Component({
 *  selector: 'my-map-cmp',
 *  directives: [SebmGoogleMap, SebmGooglePolygon],
 *  styles: [`
 *    .semb-map-container {
 *      height: 300px;
 *    }
 * `],
 *  template: `
 *    <semb-map [latitude]="lat" [longitude]="lng" [zoom]="zoom">
 *      <semb-map-polygon [paths]="paths">
 *      </semb-map-polygon>
 *    </semb-map>
 *  `
 * })
 * export class MyMapCmp {
 *   lat: number = 0;
 *   lng: number = 0;
 *   zoom: number = 10;
 *   paths: Array<LatLngLiteral> = [
 *     { lat: 0,  lng: 10 },
 *     { lat: 0,  lng: 20 },
 *     { lat: 10, lng: 20 },
 *     { lat: 10, lng: 10 },
 *     { lat: 0,  lng: 10 }
 *   ]
 *   // Nesting paths will create a hole where they overlap;
 *   nestedpPaths: Array<Array<LatLngLiteral>> = [[
 *     { lat: 0,  lng: 10 },
 *     { lat: 0,  lng: 20 },
 *     { lat: 10, lng: 20 },
 *     { lat: 10, lng: 10 },
 *     { lat: 0,  lng: 10 }
 *   ], [
 *     { lat: 0, lng: 15 },
 *     { lat: 0, lng: 20 },
 *     { lat: 5, lng: 20 },
 *     { lat: 5, lng: 15 },
 *     { lat: 0, lng: 15 }
 *   ]]
 * }
 * ```
 */
@Directive({
  selector: 'semb-map-polygon',
  inputs: [
    'clickable',
    'draggable',
    'editable',
    'fillColor',
    'fillOpacity',
    'geodesic',
    'paths',
    'strokeColor',
    'strokeOpacity',
    'strokeWeight',
    'visible',
    'zIndex',
  ],
  outputs: [
    'lineClick', 'lineDblClick', 'lineDrag', 'lineDragEnd', 'lineMouseDown', 'lineMouseMove',
    'lineMouseOut', 'lineMouseOver', 'lineMouseUp', 'lineRightClick'
  ]
})
export class SebmGoogleMapPolygon implements OnDestroy, OnChanges, AfterContentInit {
  /**
   * Indicates whether this Polygon handles mouse events. Defaults to true.
   */
  clickable: boolean = true;
  /**
   * If set to true, the user can drag this shape over the map. The geodesic
   * property defines the mode of dragging. Defaults to false.
   */
  draggable: boolean = false;
  /**
   * If set to true, the user can edit this shape by dragging the control
   * points shown at the vertices and on each segment. Defaults to false.
   */
  editable: boolean = false;
  /**
   * The fill color. All CSS3 colors are supported except for extended
   * named colors.
   */
  fillColor: string = '#fff';
  /**
   * The fill opacity between 0.0 and 1.0
   */
  fillOpacity: number = 0.7;
  /**
   * When true, edges of the polygon are interpreted as geodesic and will
   * follow the curvature of the Earth. When false, edges of the polygon are
   * rendered as straight lines in screen space. Note that the shape of a
   * geodesic polygon may appear to change when dragged, as the dimensions
   * are maintained relative to the surface of the earth. Defaults to false.
   */
  geodesic: boolean = false;
  /**
   * The ordered sequence of coordinates that designates a closed loop.
   * Unlike polylines, a polygon may consist of one or more paths.
   *  As a result, the paths property may specify one or more arrays of
   * LatLng coordinates. Paths are closed automatically; do not repeat the
   * first vertex of the path as the last vertex. Simple polygons may be
   * defined using a single array of LatLngs. More complex polygons may
   * specify an array of arrays. Any simple arrays are converted into Arrays.
   * Inserting or removing LatLngs from the Array will automatically update
   * the polygon on the map.
   */
  paths: Array<LatLng|LatLngLiteral>|Array<Array<LatLng|LatLngLiteral>> = [];
  /**
   * The stroke color. All CSS3 colors are supported except for extended
   * named colors.
   */
  strokeColor: string;
  /**
   * The stroke opacity between 0.0 and 1.0
   */
  strokeOpacity: number;
  /**
   * The stroke width in pixels.
   */
  strokeWeight: number;
  /**
   * Whether this polygon is visible on the map. Defaults to true.
   */
  visible: boolean;
  /**
   * The zIndex compared to other polys.
   */
  zIndex: number;

  /**
   * This event is fired when the DOM click event is fired on the Polygon.
   */
  lineClick: EventEmitter<PolyMouseEvent> = new EventEmitter<PolyMouseEvent>();

  /**
   * This event is fired when the DOM dblclick event is fired on the Polygon.
   */
  lineDblClick: EventEmitter<PolyMouseEvent> = new EventEmitter<PolyMouseEvent>();

  /**
   * This event is repeatedly fired while the user drags the polygon.
   */
  lineDrag: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  /**
   * This event is fired when the user stops dragging the polygon.
   */
  lineDragEnd: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  /**
   * This event is fired when the user starts dragging the polygon.
   */
  lineDragStart: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  /**
   * This event is fired when the DOM mousedown event is fired on the Polygon.
   */
  lineMouseDown: EventEmitter<PolyMouseEvent> = new EventEmitter<PolyMouseEvent>();

  /**
   * This event is fired when the DOM mousemove event is fired on the Polygon.
   */
  lineMouseMove: EventEmitter<PolyMouseEvent> = new EventEmitter<PolyMouseEvent>();

  /**
   * This event is fired on Polygon mouseout.
   */
  lineMouseOut: EventEmitter<PolyMouseEvent> = new EventEmitter<PolyMouseEvent>();

  /**
   * This event is fired on Polygon mouseover.
   */
  lineMouseOver: EventEmitter<PolyMouseEvent> = new EventEmitter<PolyMouseEvent>();

  /**
   * This event is fired whe the DOM mouseup event is fired on the Polygon
   */
  lineMouseUp: EventEmitter<PolyMouseEvent> = new EventEmitter<PolyMouseEvent>();

  /**
   * This even is fired when the Polygon is right-clicked on.
   */
  lineRightClick: EventEmitter<PolyMouseEvent> = new EventEmitter<PolyMouseEvent>();

  private static _polygonOptionsAttributes: Array<string> = [
    'clickable', 'draggable', 'editable', 'fillColor', 'fillOpacity', 'geodesic', 'icon', 'map',
    'paths', 'strokeColor', 'strokeOpacity', 'strokeWeight', 'visible', 'zIndex', 'draggable',
    'editable', 'visible'
  ];

  private _id: string;
  private _polygonAddedToManager: boolean = false;
  private _subscriptions: Subscription[] = [];

  constructor(private _polygonManager: PolygonManager) {}

  /** @internal */
  ngAfterContentInit() {
    if (!this._polygonAddedToManager) {
      this._init();
    }
  }

  ngOnChanges(changes: SimpleChanges): any {
    if (!this._polygonAddedToManager) {
      this._init();
      return;
    }

    let options: {[propName: string]: any} = {};
    const optionKeys = Object.keys(changes).filter(
        k => SebmGoogleMapPolygon._polygonOptionsAttributes.indexOf(k) !== -1);
    optionKeys.forEach(k => options[k] = changes[k].currentValue);
    this._polygonManager.setPolygonOptions(this, options);
  }

  private _init() {
    this._polygonManager.addPolygon(this);
    this._polygonAddedToManager = true;
    this._addEventListeners();
  }

  private _addEventListeners() {
    const handlers = [
      {name: 'click', handler: (ev: PolyMouseEvent) => this.lineClick.emit(ev)},
      {name: 'dbclick', handler: (ev: PolyMouseEvent) => this.lineDblClick.emit(ev)},
      {name: 'drag', handler: (ev: MouseEvent) => this.lineDrag.emit(ev)},
      {name: 'dragend', handler: (ev: MouseEvent) => this.lineDragEnd.emit(ev)},
      {name: 'dragstart', handler: (ev: MouseEvent) => this.lineDragStart.emit(ev)},
      {name: 'mousedown', handler: (ev: PolyMouseEvent) => this.lineMouseDown.emit(ev)},
      {name: 'mousemove', handler: (ev: PolyMouseEvent) => this.lineMouseMove.emit(ev)},
      {name: 'mouseout', handler: (ev: PolyMouseEvent) => this.lineMouseOut.emit(ev)},
      {name: 'mouseover', handler: (ev: PolyMouseEvent) => this.lineMouseOver.emit(ev)},
      {name: 'mouseup', handler: (ev: PolyMouseEvent) => this.lineMouseUp.emit(ev)},
      {name: 'rightclick', handler: (ev: PolyMouseEvent) => this.lineRightClick.emit(ev)},
    ];
    handlers.forEach((obj) => {
      const os = this._polygonManager.createEventObservable(obj.name, this).subscribe(obj.handler);
      this._subscriptions.push(os);
    });
  }

  /** @internal */
  id(): string { return this._id; }

  /** @internal */
  ngOnDestroy() {
    this._polygonManager.deletePolygon(this);
    // unsubscribe all registered observable subscriptions
    this._subscriptions.forEach((s) => s.unsubscribe());
  }
}