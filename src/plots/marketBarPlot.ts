
namespace Plottable.Plots {


	export class MarketBar<X, Y> extends Plot {

		/** pixel size - width/length of ticks off main bar for open/close of day */
		//private TICK_WIDTH;

		static X_SCALE_KEY = "xscale";
		static Y_SCALE_KEY = "yscale";

		static _X_KEY = "x";
		static _Y_KEY = "y";

		_renderBounds: {
			x: {
				min: number,
				max: number
			},
			y: {
				min: number,
				max: number
			}
		};
		_renderMaxX: number = 0;
		_renderMaxY: number = 0;
		/**
		 * A Market Bar Plot draws vertical lines 
		 * from the high of the day to the low of the day
		 * with a horizontal left tick indicating the open
		 * and a horizontal right tick indicating the close
		 */
		constructor() {
			super();
			this.addClass("marketbar-plot");
			this.attr("stroke", new Scales.Color().range()[0]);
			this.attr("stroke-width", 4);
			this.attr("fill", "none");
			//this.TICK_WIDTH = this.scaleX(MarketBar.TICK_WIDTH_STATIC);
		}

		protected _createDrawer(dataset: Dataset) {
			return new Plottable.Drawers.Line(dataset);
		}

		//is this per element or for the whole plot?
		protected _propertyProjectors(): AttributeToProjector {
			let attrToProjector = super._propertyProjectors();
			attrToProjector["d"] = (datum: any, index: number, ds: Dataset) => {
				let path = this.d(datum, index, ds);
				return path;
			}
			<Scale<X, any>>this._propertyBindings.get(MarketBar.X_SCALE_KEY).scale.range([new Date()]);
			return attrToProjector;
		}
		/**
				protected _constructAreaProjector(xProjector: Projector, yProjector: Projector) {
					let definedProjector = (d: any, i: number, dataset: Dataset) => {
						let positionX = Plot._scaledAccessor(this.x())(d, i, dataset);
						let positionY = Plot._scaledAccessor(this.y())(d, i, dataset);
						return Utils.Math.isValidNumber(positionX) && Utils.Math.isValidNumber(positionY);
					};
					return (datum: any[], index: number, dataset: Dataset) => {
						return d3.svg.line()
							.x((innerDatum, innerIndex) => xProjector(innerDatum, innerIndex, dataset))
							.y((innerDatum, innerIndex) => yProjector(innerDatum, innerIndex, dataset))
							.interpolate("linear")
							.defined((innerDatum, innerIndex) => definedProjector(innerDatum, innerIndex, dataset))(datum);
					};
				}
		**/

		/**
 * Gets the AccessorScaleBinding for X.
 */
		//  public x(): Plots.AccessorScaleBinding<X, number>;
		/**
		 * Sets X to a constant number or the result of an Accessor<number>.
		 *
		 * @param {number|Accessor<number>} x
		 * @returns {XYPlot} The calling XYPlot.
		 */
		//  public x(x: number | Accessor<number>): this;
		/**
		 * Sets X to a scaled constant value or scaled result of an Accessor.
		 * The provided Scale will account for the values when autoDomain()-ing.
		 *
		 * @param {X|Accessor<X>} x
		 * @param {Scale<X, number>} xScale
		 * @returns {XYPlot} The calling XYPlot.
		 */
		/**
		  public x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
		  public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
			if (!xScale) {
				this._bindProperty(MarketBar.X_SCALE_KEY, (d: any, i: number, ds: Dataset) => 
					function(d: any, i: any, ds: Dataset): number {
						
					}, new Plottable.Scales.Time())  ;
				xScale = this._propertyBindings.get(MarketBar.X_SCALE_KEY);
			}
			this._bindProperty(MarketBar._X_KEY, x, xScale);
		
			return this;
		  }
		  **/

		/**
		 * Gets the AccessorScaleBinding for Y.
		 */
		public y(): Plots.AccessorScaleBinding<Y, number>;
		/**
		 * Sets Y to a constant number or the result of an Accessor<number>.
		 *
		 * @param {number|Accessor<number>} y
		 * @returns {XYPlot} The calling XYPlot.
		 */
		public y(y: number | Accessor<number>): this;
		/**
		 * Sets Y to a scaled constant value or scaled result of an Accessor.
		 * The provided Scale will account for the values when autoDomain()-ing.
		 *
		 * @param {Y|Accessor<Y>} y
		 * @param {Scale<Y, number>} yScale
		 * @returns {XYPlot} The calling XYPlot.
		 */
		public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
		public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
			if (y == null) {
				return this._propertyBindings.get(MarketBar._Y_KEY);
			}

			this._bindProperty(MarketBar._Y_KEY, y, yScale);

			return this;
		}



		scaleX(valueIn?: any): number {
			let xScale: Plots.AccessorScaleBinding<any, any> = this._propertyBindings.get(MarketBar.X_SCALE_KEY);
			if (!xScale) {
				this._bindProperty(MarketBar.X_SCALE_KEY, (d: any, i: number, ds: Dataset) => this.scaleX(d.x), new Plottable.Scales.Time());
				xScale = this._propertyBindings.get(MarketBar.X_SCALE_KEY);
			}
			if (valueIn) {
				return xScale.scale.scale(valueIn);
			}
		}
		mathTimeDate(hours: number, date: Date): Date {
			let days = 0;
			let minutes = 0;
			let subtime = (days * 24 * 60 * 60 * 1000) +
				(hours * 60 * 60 * 1000) +
				(minutes * 60 * 1000);

			let resultTime = new Date(date.getTime() + subtime);
			return resultTime;
		}

		public d(d: any, index: number, dataset: Dataset): any {
			let path: string =
				"M" +
				// tick start 12h (1/2 day) to the left.
				this.scaleX(this.mathTimeDate(-12, d.date)) + "," +
				d.open +
				"L" +
				this.scaleX(d.date) + "," +
				d.open +
				"L" +
				this.scaleX(d.date) + "," +
				d.low +
				"L" +
				this.scaleX(d.date) + "," +
				d.high +
				"L" +
				this.scaleX(d.date) + "," +
				d.close +
				"L" +
				// tick start 12h (1/2 day) to the right.
				this.scaleX(this.mathTimeDate(12, d.date)) + "," +
				d.close;

			return path;
		}

		protected pointSet(d: any, index: number, dataset: Dataset): {x: any,y: any}[] {
			let pointSet: {
				x: any,
				y: any
			}[] = [
					{
						// tick start 12h (1/2 day) to the left.
						x: new Date(new Date().setDate(new Date().getDate() - .5)),
						y: d.open,
					},
					{
						x: d.date,
						y: d.open,
					},
					{
						x: d.date,
						y: d.low,
					},
					{
						x: d.date,
						y: d.high,
					},
					{
						x: d.date,
						y: d.close,
					},
					{
						// tick start 12h (1/2 day) to the right.
						x: new Date(new Date().setDate(new Date().getDate() + .5)),
						y: d.close,
					}
				];
			for (let item of pointSet) {
				console.log(item);
			}
			return pointSet;
		}


		/**
		 * Returns the PlotEntity nearest to the query point by X then by Y, or undefined if no PlotEntity can be found.
		 *
		 * @param {Point} queryPoint
		 * @returns {PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
		 */
		public entityNearestByXThenY(queryPoint: Point): PlotEntity {
			let minXDist = Infinity;
			let minYDist = Infinity;
			let closest: PlotEntity;
			this.entities().forEach((entity) => {
				if (!this._entityVisibleOnPlot(entity.position, entity.datum, entity.index, entity.dataset)) {
					return;
				}
				let xDist = Math.abs(queryPoint.x - entity.position.x);
				let yDist = Math.abs(queryPoint.y - entity.position.y);

				if (xDist < minXDist || xDist === minXDist && yDist < minYDist) {
					closest = entity;
					minXDist = xDist;
					minYDist = yDist;
				}
			});

			return closest;
		}

		private dayToPoints(datum: any, datasetIndex: number, dataset: Dataset): Point[] {
			let positions: Point[];
			let datumPositions: {
				x: any,
				y: any
			}[] = this.pointSet(datum, datasetIndex, dataset);
			datumPositions.forEach(datumPosition => {
				positions.push(this._pixelPoint(datum, datasetIndex, dataset));
			});
			return positions;
		}

		protected _lightweightEntities(datasets = this.datasets()) {
			let lightweightEntities: LightweightPlotEntity[] = [];
			// @param {Dataset} dataset - is extracted from datasets
			datasets.forEach( dataset => {
				let drawer = this._datasetToDrawer.get(dataset);
				let validDatumIndex = 0;

				dataset.data().forEach((datum: any, datasetIndex: number) => {
					// EDH - I've added an extra layer of lookups, mapping the 6 x points per datum / day so they are recorded as entities
					this.dayToPoints(datum, datasetIndex, dataset).forEach( position => {
						if (Utils.Math.isNaN(position.x) || Utils.Math.isNaN(position.y)) {
							return;
						}
						lightweightEntities.push({
							datum: datum,
							index: datasetIndex,
							dataset: dataset,
							position: position,
							component: this,
							drawer: drawer,
							validDatumIndex: validDatumIndex,
						});
						validDatumIndex++;
					});
				});
			});
			return lightweightEntities;
		}
		protected _getDataToDraw() {
			let dataToDraw: Utils.Map<Dataset, any[]> = super._getDataToDraw();

			let definedFunction = (d: any, i: number, dataset: Dataset) => {
				let positionX = Plot._scaledAccessor(this.x())(d, i, dataset);
				let positionY = Plot._scaledAccessor(this.y())(d, i, dataset);
				return Utils.Math.isValidNumber(positionX) &&
					Utils.Math.isValidNumber(positionY);
			};

			this.datasets().forEach((dataset) => {
				dataToDraw.set(dataset, dataToDraw.get(dataset).filter((d, i) => definedFunction(d, i, dataset)));
			});
			return dataToDraw;
		}




		/**
		 * Gets the Entities that intersect the Bounds.
		 *
		 * @param {Bounds} bounds
		 * @returns {PlotEntity[]}
		 */
		//public entitiesIn(bounds: Bounds): PlotEntity[];
		/**
		 * Gets the Entities that intersect the area defined by the ranges.
		 *
		 * @param {Range} xRange
		 * @param {Range} yRange
		 * @returns {PlotEntity[]}
		 */
		/**
		public entitiesIn(xRange: Range, yRange: Range): PlotEntity[];
		public entitiesIn(xRangeOrBounds: Range | Bounds, yRange?: Range): PlotEntity[] {
			let dataXRange: Range;
			let dataYRange: Range;
			if (yRange == null) {
				let bounds = (<Bounds>xRangeOrBounds);
				dataXRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
				dataYRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };
			} else {
				dataXRange = (<Range>xRangeOrBounds);
				dataYRange = yRange;
			}
			return this._entitiesIntersecting(dataXRange, dataYRange);
		}

		
		private _entitiesIntersecting(xRange: Range, yRange: Range): PlotEntity[] {
			let intersected: PlotEntity[] = [];
			let attrToProjector = this._generateAttrToProjector();
			this.entities().forEach((entity) => {
				if (this._lineIntersectsBox(entity, xRange, yRange, attrToProjector)) {
					intersected.push(entity);
				}
			});
			return intersected;
		}

		private _lineIntersectsBox(entity: PlotEntity, xRange: Range, yRange: Range, attrToProjector: AttributeToProjector) {
			let x1 = attrToProjector["x1"](entity.datum, entity.index, entity.dataset);
			let x2 = attrToProjector["x2"](entity.datum, entity.index, entity.dataset);
			let y1 = attrToProjector["y1"](entity.datum, entity.index, entity.dataset);
			let y2 = attrToProjector["y2"](entity.datum, entity.index, entity.dataset);

			// check if any of end points of the segment is inside the box
			if ((xRange.min <= x1 && x1 <= xRange.max && yRange.min <= y1 && y1 <= yRange.max) ||
				(xRange.min <= x2 && x2 <= xRange.max && yRange.min <= y2 && y2 <= yRange.max)) {
				return true;
			}

			let startPoint = { x: x1, y: y1 };
			let endPoint = { x: x2, y: y2 };
			let corners = [
				{ x: xRange.min, y: yRange.min },
				{ x: xRange.min, y: yRange.max },
				{ x: xRange.max, y: yRange.max },
				{ x: xRange.max, y: yRange.min },
			];
			let intersections = corners.filter((point: Point, index: number) => {
				if (index !== 0) {
					// return true if border formed by conecting current corner and previous corner intersects with the segment
					return this._lineIntersectsSegment(startPoint, endPoint, point, corners[index - 1]) &&
						this._lineIntersectsSegment(point, corners[index - 1], startPoint, endPoint);
				}
				return;
			});
			return intersections.length > 0;
		}
		private _lineIntersectsSegment(point1: Point, point2: Point, point3: Point, point4: Point) {
			let calcOrientation = (point1: Point, point2: Point, point: Point) => {
				return (point2.x - point1.x) * (point.y - point2.y) - (point2.y - point1.y) * (point.x - point2.x);
			};
			// point3 and point4 are on different sides of line formed by point1 and point2
			return calcOrientation(point1, point2, point3) * calcOrientation(point1, point2, point4) < 0;
		}
		*/
	}
}