namespace Plottable.Plots {

	export class MarketBar extends Plot {

		/** pixel size - width/length of ticks off main bar for open/close of day */
		//private TICK_WIDTH;

		static X_SCALE_KEY = "xscale";
		static Y_SCALE_KEY = "yscale";
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
				// @param {array} of x,y coordinates x6 for each dataset element
				let pointSet = this.pointSet(datum, index, ds);
				d3.svg.line()
					.x((innerDatum, innerIndex) => this.pointSetX(innerDatum, innerIndex, pointSet))
					.y((innerDatum, innerIndex) => this.pointSetY(innerDatum, innerIndex, pointSet))
					.interpolate("linear");
			};
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

		pointSetX(d: any, index: number, dataset: Dataset): number {
			return this.scaleX((d.x));
		}

		/**
		 * pointSetY is easy, it just returns the y parameter from the pre-processed pointSet
		 * @return {number} point coordinate of y 
		 */
		pointSetY(d: any, index: number, dataset: Dataset): number {
			return d.y;
		}



		// can do x(xScale) to set scale and y(yScale)
		// & x() and y() to get scales still
		// default scale is:
		scaleX(valueIn?: any):number {
			let xScale: Plots.AccessorScaleBinding<any, any> = this._propertyBindings.get(MarketBar.X_SCALE_KEY);
			if (!xScale) {
				this._bindProperty(MarketBar.X_SCALE_KEY, (d: any, i: number, ds: Dataset) => this.pointSetX, new Plottable.Scales.Time());
				xScale = this._propertyBindings.get(MarketBar.X_SCALE_KEY);
			}
			if (valueIn) {
				return xScale.scale.scale(valueIn);
			}
		}

		public pointSet(d: any, index: number, dataset: Dataset): any {
			let pointSet: {
				x: any,
				y: any
			}[] = [
				{
					// tick start 12h (1/2 day) to the left.
					x: new Date( new Date().setDate( new Date().getDate() - .5 ) ),
					y: d.open
				},
				{
					x: d.date,
					y: d.open
				},
				{
					x: d.date,
					y: d.low
				},
				{
					x: d.date,
					y: d.high
				},
				{
					x: d.date,
					y: d.close
				},
				{
					// tick start 12h (1/2 day) to the right.
					x: new Date( new Date().setDate( new Date().getDate() + .5 ) ),
					y: d.close
				}
			];
			for (let item of pointSet) {
				console.log(item);
			}
			return pointSet;
		}


		/**
		 * Gets the Entities that intersect the Bounds.
		 *
		 * @param {Bounds} bounds
		 * @returns {PlotEntity[]}
		 */
		public entitiesIn(bounds: Bounds): PlotEntity[];
		/**
		 * Gets the Entities that intersect the area defined by the ranges.
		 *
		 * @param {Range} xRange
		 * @param {Range} yRange
		 * @returns {PlotEntity[]}
		 */
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
			/* tslint:disable no-shadowed-variable */
			let calcOrientation = (point1: Point, point2: Point, point: Point) => {
				return (point2.x - point1.x) * (point.y - point2.y) - (point2.y - point1.y) * (point.x - point2.x);
			};
			/* tslint:enable no-shadowed-variable */

			// point3 and point4 are on different sides of line formed by point1 and point2
			return calcOrientation(point1, point2, point3) * calcOrientation(point1, point2, point4) < 0;
		}
	}
}