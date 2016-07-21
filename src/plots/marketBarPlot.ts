
namespace Plottable.Plots {


	export class MarketBar<X, Y> extends XYPlot<Date, number> {

		/** pixel size - width/length of ticks off main bar for open/close of day */
		//private TICK_WIDTH;

		static X_SCALE_KEY = "xscale";
		static Y_SCALE_KEY = "yscale";



		//static _X_KEY = "x";
		//static _Y_KEY = "y";

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

			// default values

			//this.x(function (d,index,dataset) { console.log(`from d.x(${d.x}=>`,d); return d.x; }, new Plottable.Scales.Time());
			//this.y(function (d,index,dataset) { console.log(`from d.y(${d.y}=>`,d); return d.y; }, new Plottable.Scales.Linear());
		}

		protected _createDrawer(dataset: Dataset) {
			return new Plottable.Drawers.Line(dataset);
		}

		protected _propertyProjectors(): AttributeToProjector {
			let propertyToProjectors = super._propertyProjectors();
			propertyToProjectors["d"] = this._constructLineProjector(Plot._scaledAccessor(this.x()), Plot._scaledAccessor(this.y()));
			return propertyToProjectors;
		}

		protected _constructLineProjector(xProjector: Projector, yProjector: Projector) {

			return (datum: any, index: number, dataset: Dataset) => {
				let dsPoints = new Dataset(this.dayToPoints(datum, index, dataset));
				let line = d3.svg.line()
					.x((innerDatum, innerIndex) => xProjector(innerDatum, innerIndex, dsPoints))
					.y((innerDatum, innerIndex) => yProjector(innerDatum, innerIndex, dsPoints))
					.interpolate("linear")(dsPoints.data());
				console.log(line);
				return line;
			};
		}

		protected _generateDrawSteps(): Drawers.DrawStep[] {
			let drawSteps: Drawers.DrawStep[] = [];
			if (this._animateOnNextRender()) {
				let attrToProjector = this._generateAttrToProjector();
				attrToProjector["d"] = this._constructLineProjector(Plot._scaledAccessor(this.x()), Plot._scaledAccessor(this.y()));
				drawSteps.push({ attrToProjector: attrToProjector, animator: this._getAnimator(Plots.Animator.RESET) });
			}

			drawSteps.push({ attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator(Plots.Animator.MAIN) });

			return drawSteps;
		}

		protected pointSet(d: any, index: number, dataset: Dataset): { x: any, y: any }[] {
			let pointSet: {
				x: any,
				y: any
			}[] = [
					{
						// tick start 12h (1/2 day) to the left.
						x: new Date(d.date.setDate(d.date.getDate() - .5)),
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
						x: new Date(d.date.setDate(d.date.getDate() + .5)),
						y: d.close,
					}
				];
			for (let item of pointSet) {
				console.log(`pointsetprint=${item}`);
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

		/**
		 * dayToPoints takes the datum and creates 6 points (x,y) to create a marketBar style graph
		 * These 6 points are the PIXEL points - their actual coordinates on the graph/ scaled
		 * [1] open,date-12h [2] open,date [3] low,date [4] high,date [5] close,date [6] close,date+12h
		 * 
		 * @param {any} datum | singular input from dataset that is being processed to create x,y coord
		 * @param {number} datasetIndex | index of datum within dataset
		 * @param {Dataset} dataset - object containing array of all data to be shown by this plot
		 * @returns {Point[]} | an array of 6 true (x,y) coordinates, describing the bar for the day. 
		 */
//		private dayToPoints(datum: any, datasetIndex: number, dataset: Dataset): Point[] {
		private dayToPoints(datum: any, datasetIndex: number, dataset: Dataset): {x:any,y:any}[] {
			let positions: Point[] = [];
			let datumPositions: {
				x: any,
				y: any
			}[] = this.pointSet(datum, datasetIndex, dataset);
			return datumPositions;
			/** 
			datumPositions.forEach(datumPosition => {
				positions.push(this._pixelPoint(datumPosition, datasetIndex, dataset));
				console.log("pixelPoint=", positions[positions.length - 1])
			});
			return positions;
			*/			
		}

		protected _lightweightEntities(datasets = this.datasets()) {
			let lightweightEntities: LightweightPlotEntity[] = [];
			// @param {Dataset} dataset - is extracted from datasets
			datasets.forEach(dataset => {
				let drawer = this._datasetToDrawer.get(dataset);
				let validDatumIndex = 0;

				dataset.data().forEach((datum: any, datasetIndex: number) => {
					// EDH - I've added an extra layer of lookups, mapping the 6 x points per datum / day so they are recorded as entities
					this.dayToPoints(datum, datasetIndex, dataset).forEach(position => {
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
			let dataToDraw: Utils.Map<Dataset, any[]> = new Utils.Map<Dataset, any[]>();
			this.datasets().forEach((dataset) => dataToDraw.set(dataset, dataset.data()));
			return dataToDraw;
		}

		protected _extentsForProperty(property: string) {
			let extents = super._extentsForProperty(property);

			/**
			 * @var {AccessorScaleBinding<X|Y|number,Date|number>} accScaleBinding | accessor-scale to use in upcoming computations
			 */
			let accScaleBinding: Plots.AccessorScaleBinding<any, any>;
			/** @var {number[]} axisVals | Array of all values that fall on the axis being queried */
			let axisVals: number[] = [];
			if ( property === "y" ){
				this.datasets().forEach(dataset => {
					[].push.apply(axisVals, dataset.data().map(function (d: any) { return d.high; }));
					[].push.apply(axisVals, dataset.data().map(function (d: any) { return d.low; }));
					accScaleBinding = this.y();
				});
			}  else if (property === "x" ) {
				this.datasets().forEach(dataset => {
					[].push.apply(axisVals, dataset.data().map(function (d: any) { return d.date; }));
					accScaleBinding = this.x();
				});
			} else {
				/** a non-coordinate property was requested - don't handle that here  */
				return extents;
			}

			/** sanity and type check, ensure scale exists and is of proper type */
			if (!(accScaleBinding && accScaleBinding.scale && accScaleBinding.scale instanceof QuantitativeScale)) {
				return extents;
			}
			/** 
			 * @var {number} minimum | the lowest (lowest close | first date) of the day in the array.
			 */
			let minimum: any = d3.min(axisVals);
			/** now we take that minumum and scale it */
			let minScaled: number = accScaleBinding.scale.scale(accScaleBinding.accessor({x: minimum, y: minimum}, 0, new Dataset()));
			/**
			 * @var {number} maximum | the highest (highest high | last date) of the day in the array.
			 */
			let maximum: any = d3.max(axisVals);
			/** now we take that minumum and scale it */
			let maxScaled: number = accScaleBinding.scale.scale(accScaleBinding.accessor({x: maximum, y: maximum}, 0, new Dataset()));
			/** @var {number[x,y]} includedValues | range for scale. */
//			let includedValues: number[] = [minScaled,maxScaled];
			let includedValues: number[] = [minimum,maximum];
			return extents.map((extent: [number, number]) => d3.extent(d3.merge([extent, includedValues])));
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