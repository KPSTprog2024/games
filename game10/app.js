'use strict';

const events = [
  {id: 1, title: '江戸を出発', date: '1689-05-16', lat: 35.6895, lng: 139.6917, desc: '旅の開始'},
  {id: 2, title: '日光', date: '1689-05-27', lat: 36.7507, lng: 139.5965, desc: '東照宮を参拝'},
  {id: 3, title: '仙台', date: '1689-06-16', lat: 38.2688, lng: 140.8721, desc: '伊達政宗の城下町'},
  {id: 4, title: '平泉', date: '1689-07-13', lat: 39.0018, lng: 141.1326, desc: '中尊寺を訪問'},
  {id: 5, title: '秋田', date: '1689-07-31', lat: 39.7200, lng: 140.1025, desc: '秋田の町'},
  {id: 6, title: '酒田', date: '1689-08-15', lat: 38.9144, lng: 139.8363, desc: '庄内藩の港町'},
  {id: 7, title: '新潟', date: '1689-08-23', lat: 37.9161, lng: 139.0364, desc: '越後路へ'},
  {id: 8, title: '金沢', date: '1689-09-05', lat: 36.5613, lng: 136.6562, desc: '加賀百万石の城下町'},
  {id: 9, title: '大津・京都着', date: '1689-09-15', lat: 35.0116, lng: 135.7681, desc: '旅の終わり'}
];

class MapTimelineApp {
  constructor() {
    this.map = L.map('map').setView([36.5, 139.8], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markers = [];
    this.pathCoords = [];
    events.forEach(ev => {
      const marker = L.marker([ev.lat, ev.lng]).addTo(this.map).bindPopup(ev.title);
      this.markers.push(marker);
      this.pathCoords.push([ev.lat, ev.lng]);
    });
    L.polyline(this.pathCoords, {color: 'seagreen'}).addTo(this.map);

    this.buildTimeline();
    this.slider = document.getElementById('slider');
    this.slider.max = events.length - 1;
    this.slider.addEventListener('input', () => {
      this.activateEvent(parseInt(this.slider.value));
    });
    this.activateEvent(0);
  }

  buildTimeline() {
    const list = document.getElementById('events');
    this.cards = [];
    events.forEach((ev, idx) => {
      const div = document.createElement('div');
      div.className = 'event';
      div.innerHTML = `<strong>${ev.date}</strong><br>${ev.title}`;
      div.addEventListener('click', () => {
        this.slider.value = idx;
        this.activateEvent(idx);
      });
      list.appendChild(div);
      this.cards.push(div);
    });
  }

  activateEvent(index) {
    this.cards.forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
    const marker = this.markers[index];
    marker.openPopup();
    this.map.setView(marker.getLatLng(), 7);
    const list = document.getElementById('events');
    list.scrollTop = this.cards[index].offsetTop - 20;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new MapTimelineApp();
});
