let map, selected;
let center = {
    lat: 45.0,
    lon: 9.0
};
let planes = {};
let numPlanes = 0;

function getPlaneIcon(plane) {
    let r = 255, g = 255, b = 0;
    let maxalt = 40000;
    let invalt = maxalt - plane.altitude;
    let isSelected = (selected == plane.hex);

    if(invalt < 0) invalt = 0;
    b = parseInt(255/maxalt*invalt);

    let he = document.createElement("p");
    he.innerHTML = ">";
    let rotation = 45 + 360 - plane.track;
    let selhtml = "";

    if(selected == plane.hex) {
        selhtml = "border: 1px dotted #0000aa; border-radius:10px";
    }

    he = `<div style="transform: rotate(-${rotation}deg); ${selhtml}">✈️</div>`;

    return L.divIcon({html: he, className: "plane-icon"});
}

function setIcon(hex) {
    planes[hex].marker.setIcon(getPlaneIcon(planes[hex]));
}

function selectPlane(planeHex) {
    if(!planes[planeHex]) return;

    let old = selected;
    selected = planeHex;
    if(planes[old]) {
        setIcon(old);
    }
    setIcon(selected);
    refreshSelectedInfo();
}

function selectPlaneCallback(hex) {
    return () => {
        return selectPlane(hex);
    }
}

function refreshGeneralInfo() {
    let i = document.getElementById("geninfo");
    i.innerHTML = numPlanes + " planes onscreen";
}

function refreshSelectedInfo() {
    let i = document.getElementById("selinfo");
    let p = planes[selected];

    if(!p) return;

    let html = `ICAO: ${p.hex}<br>${(p.flight.length) ? `<b>${p.flight}</b><br>` : ""}Altitude: ${p.altitude}ft<br>Speed: ${p.speed}kn<br>Coordinates: ${p.lat}, ${p.lon}<br>`;
    i.innerHTML = html;
}

function fetchData() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "./data.json");
    xhr.addEventListener("readystatechange", e => {
        if(xhr.readyState != 4) return;
        if(xhr.status != 200) return console.log(`./data.json non 200 http code ${xhr.status}`);

        let data = JSON.parse(xhr.responseText);

        let stillHere = {};
        for(let j = 0; j < data.length; j++) {
            let plane = data[j];
            let marker = null;

            stillHere[plane.hex] = true;
            plane.flight = `${plane.flight}`;

            if(planes[plane.hex]) {
                let myplane = planes[plane.hex];
                marker = myplane.marker;
                marker.setLatLng([plane.lat, plane.lon]);
                marker.setIcon(getPlaneIcon(plane));
                myplane.altitude = plane.altitude;
                myplane.speed = plane.speed;
                myplane.lat = plane.lat;
                myplane.lon = plane.lon;
                myplane.track = plane.track;
                myplane.flight = plane.flight;

                if(myplane.hex == selected) refreshSelectedInfo();
            } else {
                let icon = getPlaneIcon(plane);
                let market = L.marker([plane.lat, plane.lon], {icon}).addTo(map);
                let hex = plane.hex;
                marker.on("click", selectPlaneCallback(plane.hex));
                plane.marker = marker;
                marker.planehex = plane.hex;
                planes[plane.hex] = plane;
            }
        }
        numPlanes = planes.length;

        for(let p in planes) {
            if(!stillHere[p]) {
                Map.removeLayer(planes[p].marker);
                delete planes[p];
            }
        }
    });
    xhr.send();
}

function initialise() {
    map = L.map("map").setView([37.0, 13.0], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox/streets-v11',
	    accessToken: 'your.mapbox.access.token'
	}).addTo(Map);

    setInterval(() => {
        fetchData();
        refreshGeneralInfo();
    }, 100);
}

window.addEventListener("load", e => {
    initialise();
});