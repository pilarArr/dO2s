import React, { Component } from 'react';
import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import PropTypes from 'prop-types';
import L from 'leaflet';
import 'leaflet-draw';

import { featurePoint2latlong, latlong2featurePoint, featurePointGetZoom } from '../../../modules/geojson-utilities';
import { waypointListOptions, rpaPathStyle, bearingPathStyle, readWaypointListOptions } from '../../../modules/mission-planning/waypoint-style-chooser.js';
import { pointsCollectionFeatureToLineString } from '../../../modules/mission-planning/waypoint-utilities.js';

import './PreFlightMap.scss';

class PreFlightMap extends Component {
  componentDidMount() {
    const currentLocation = this.props.location;
    const waypointArrayExists = this.props.mission &&
      this.props.mission.flightPlan &&
      this.props.mission.flightPlan.missionCalculation &&
      this.props.mission.flightPlan.missionCalculation.waypointList &&
      this.props.mission.flightPlan.missionCalculation.waypointList.features;
    let centerMap = currentLocation;
    if (waypointArrayExists) {
      centerMap = waypointArrayExists[waypointArrayExists.length - 1];
    }
    const missionmap = L.map('preflightmap').setView(featurePoint2latlong(centerMap), featurePointGetZoom(currentLocation));
    this.missionmap = missionmap;
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services' +
'/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    }).addTo(missionmap);

    // FeatureGroup is to store editable layers
    const drawnItems = new L.FeatureGroup().addTo(missionmap);
    const geoJSONTakeOffPointLayer = L.geoJSON().addTo(missionmap);
    const geoJSONLandingPointLayer = L.geoJSON().addTo(missionmap);
    const geoJSONRpaPathLayer = L.geoJSON().addTo(missionmap);
    const geoJSONSentWaypointListLayer = L.geoJSON().addTo(missionmap);
    const geoJSONReadWaypointListLayer = L.geoJSON().addTo(missionmap);
    const geoJSONAngleToPointLayer = L.geoJSON().addTo(missionmap);

    const overlayMaps = {
      'Sent WPList': geoJSONSentWaypointListLayer,
      'Read WPList': geoJSONReadWaypointListLayer,
    };

    L.control.layers(null, overlayMaps).addTo(missionmap);

    // we load these variables in the component to access them
    // in other functions.
    this.geoJSONRpaPathLayer = geoJSONRpaPathLayer;
    this.geoJSONSentWaypointListLayer = geoJSONSentWaypointListLayer;
    this.geoJSONReadWaypointListLayer = geoJSONReadWaypointListLayer;
    this.geoJSONAngleToPointLayer = geoJSONAngleToPointLayer;

    // Here we load the current mission data on the map if it exists
    const { flightPlan } = this.props.mission;
    if (flightPlan) {
      if (flightPlan.missionCalculation) {
        if (flightPlan.missionCalculation.waypointList) {
          const rpaPath =
           pointsCollectionFeatureToLineString(flightPlan.missionCalculation.waypointList);
          const myRpaPathLayer = L.geoJSON(rpaPath, rpaPathStyle);
          geoJSONRpaPathLayer.addLayer(myRpaPathLayer.getLayers()[0]);
          const myWaypointList = flightPlan.missionCalculation.waypointList;
          const myWaypointListLayer = L.geoJSON(myWaypointList, waypointListOptions);
          myWaypointListLayer.eachLayer(layer =>
            geoJSONSentWaypointListLayer.addLayer(layer));
        }
      }

      if (flightPlan.landingBearing) {
        const myLandingPathBearingLayer = L.geoJSON(flightPlan.landingBearing, bearingPathStyle);
        this.geoJSONAngleToPointLayer.addLayer(myLandingPathBearingLayer.getLayers()[0]);
      }
    }
    if (this.props.readWPList) {
      if (!_.isEmpty(this.props.readWPList)) {
        const myReadWaypointList = this.props.readWPList;
        const myReadWaypointListLayer = L.geoJSON(myReadWaypointList, readWaypointListOptions);
        myReadWaypointListLayer.eachLayer(layer =>
          geoJSONReadWaypointListLayer.addLayer(layer));
      }
    }

    missionmap.on('click', (e) => {
      if (this.props.getAngleActive) {
        const toPoint = latlong2featurePoint(e.latlng.wrap());
        const newLandingBearing = this.drawLandingBearing(toPoint);
        this.props.updateLandingBearing(newLandingBearing);
      }
    });

    missionmap.on('mousemove', (e) => {
      if (this.props.getAngleActive) {
        const toPoint = latlong2featurePoint(e.latlng.wrap());
        this.drawLandingBearing(toPoint);
      }
    });
  }

  componentDidUpdate() {
    // re lodaing the mission if anything changes
    const { flightPlan } = this.props.mission;
    if (flightPlan) {
      if (flightPlan.missionCalculation) {
        if (flightPlan.missionCalculation.waypointList) {
          this.geoJSONRpaPathLayer.clearLayers();
          this.geoJSONSentWaypointListLayer.clearLayers();
          const rpaPath =
           pointsCollectionFeatureToLineString(flightPlan.missionCalculation.waypointList);
          const myRpaPathLayer = L.geoJSON(rpaPath, rpaPathStyle);
          this.geoJSONRpaPathLayer.addLayer(myRpaPathLayer.getLayers()[0]);
          const myWaypointList = flightPlan.missionCalculation.waypointList;
          const myWaypointListLayer = L.geoJSON(myWaypointList, waypointListOptions);
          myWaypointListLayer.eachLayer(layer =>
            (this.geoJSONSentWaypointListLayer.addLayer(layer)));
        }
      }

      if (flightPlan.landingBearing) {
        this.geoJSONAngleToPointLayer.clearLayers();
        const myLandingPathBearingLayer = L.geoJSON(flightPlan.landingBearing, bearingPathStyle);
        this.geoJSONAngleToPointLayer.addLayer(myLandingPathBearingLayer.getLayers()[0]);
      }

      const myflightPlanKeys = Object.keys(flightPlan);
      const clearedKeys = ['takeOffPoint', 'landingPoint', 'missionArea', 'missionCalculation'];
      const myflightPlanKeysFiltered = myflightPlanKeys.filter(word => clearedKeys.includes(word));
      if (myflightPlanKeysFiltered.length === 0) {
        this.geoJSONTakeOffPointLayer.clearLayers();
        this.geoJSONLandingPointLayer.clearLayers();
        this.drawnItems.clearLayers();
        this.geoJSONRpaPathLayer.clearLayers();
        this.geoJSONSentWaypointListLayer.clearLayers();
        this.geoJSONReadWaypointListLayer.clearLayers();
      }
    }

    if (this.props.readWPList) {
      if (_.isEmpty(this.props.readWPList)) {
        this.geoJSONReadWaypointListLayer.clearLayers();
      } else {
        this.geoJSONReadWaypointListLayer.clearLayers();
        const myReadWaypointList = this.props.readWPList;
        const myReadWaypointListLayer = L.geoJSON(myReadWaypointList, readWaypointListOptions);
        myReadWaypointListLayer.eachLayer(layer =>
          this.geoJSONReadWaypointListLayer.addLayer(layer));
      }
    }

    if (this.props.editWayPointsActive &&
      this.geoJSONRpaPathLayer.getLayers().length !== 0) {
      this.geoJSONRpaPathLayer.getLayers()[0].editing.enable();
    } else if (!this.props.editWayPointsActive &&
    this.geoJSONRpaPathLayer.getLayers().length !== 0) {
      this.geoJSONRpaPathLayer.getLayers()[0].editing.disable();
    }
  }

  drawLandingBearing(toPoint) {
    const { flightPlan } = this.props.mission;
    if (flightPlan && flightPlan.missionCalculation && flightPlan.missionCalculation.waypointList) {
      const waypointArraylength = flightPlan.missionCalculation.waypointList.features.length;
      const waypointArray = flightPlan.missionCalculation.waypointList.features;
      const landingPoint = JSON.parse(JSON.stringify(waypointArray[waypointArraylength - 1]));

      const landingBearingFeatureColec = {
        type: 'FeatureCollection',
        features: [],
        properties: { },
      };

      landingBearingFeatureColec.features.push(landingPoint);
      landingBearingFeatureColec.features.push(toPoint);

      const landingBearingLineString =
       pointsCollectionFeatureToLineString(landingBearingFeatureColec);

      this.geoJSONAngleToPointLayer.clearLayers();
      const myLandingPathBearingLayer = L.geoJSON(landingBearingLineString, bearingPathStyle);
      this.geoJSONAngleToPointLayer.addLayer(myLandingPathBearingLayer.getLayers()[0]);
      return landingBearingLineString;
    }
    Bert.alert('There is no waypoint list', 'warning');
    return {};
  }

  render() {
    return (
      <div className="PreFlightMap" style={{ height: this.props.height }}>
        <div id="preflightmap" />
      </div>);
  }
}

PreFlightMap.defaultProps = {
  location: {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-3.7038, 40.4168, 0],
    },
    properties: {
      zoom: 12,
    },
  },
  height: '80vh',
  setTakeOffPoint: () => {},
  setLandingPoint: () => {},
  editWayPointsActive: false,
  editWayPoints: () => {},
  updateLandingBearing: () => {},
  readWPList: {},
};

PreFlightMap.propTypes = {
  location: PropTypes.object,
  mission: PropTypes.object.isRequired,
  height: PropTypes.string,
  setTakeOffPoint: PropTypes.func,
  setLandingPoint: PropTypes.func,
  editWayPointsActive: PropTypes.bool,
  editWayPoints: PropTypes.func,
  getAngleActive: PropTypes.bool,
  updateLandingBearing: PropTypes.func,
  readWPList: PropTypes.object,
};

export default PreFlightMap;
