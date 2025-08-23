// Application state
let leftMap = null;
let rightMap = null;
let homeSettingMode = false;
let homeLocation = null;
let homeMarker = null;
let syncingZoom = false;

// Default coordinates (Tokyo Station)
const DEFAULT_COORDS = [35.6812, 139.7671];
const DEFAULT_ZOOM = 14;

// DOM elements
const homeSettingBtn = document.getElementById('home-setting-btn');
const statusText = document.getElementById('status-text');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Leaflet to be fully loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        showError('地図ライブラリの読み込みに失敗しました');
        return;
    }
    
    setTimeout(function() {
        initializeMaps();
        setupEventListeners();
        updateUI();
    }, 500);
});

// Initialize both maps
function initializeMaps() {
    try {
        // Initialize left map (comparison map)
        leftMap = L.map('map-left').setView(DEFAULT_COORDS, DEFAULT_ZOOM);

        // Initialize right map (home map)
        rightMap = L.map('map-right', {
            zoomControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false
        }).setView(DEFAULT_COORDS, DEFAULT_ZOOM);

        // Add tile layers
        addTileLayersToMaps();

        // Setup map synchronization
        setupMapSync();

        // Force map resize
        setTimeout(function() {
            leftMap.invalidateSize();
            rightMap.invalidateSize();
        }, 100);

        console.log('Maps initialized successfully');
    } catch (error) {
        console.error('Error initializing maps:', error);
        showError('地図の初期化に失敗しました');
    }
}

// Add tile layers to both maps
function addTileLayersToMaps() {
    try {
        const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';
        
        // Use a more reliable tile server URL format
        const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        
        // Create and add tile layer to left map
        const leftTileLayer = L.tileLayer(tileUrl, {
            attribution: attribution,
            maxZoom: 19,
            crossOrigin: true
        });
        leftTileLayer.addTo(leftMap);
        
        // Create and add tile layer to right map
        const rightTileLayer = L.tileLayer(tileUrl, {
            attribution: attribution,
            maxZoom: 19,
            crossOrigin: true
        });
        rightTileLayer.addTo(rightMap);

        console.log('Tile layers added successfully');
    } catch (error) {
        console.error('Error adding tile layers:', error);
    }
}

// Setup map synchronization (zoom only)
function setupMapSync() {
    // Sync zoom from left to right
    leftMap.on('zoomstart', function() {
        syncingZoom = true;
    });
    
    leftMap.on('zoomend', function() {
        if (!syncingZoom) return;
        
        const currentZoom = leftMap.getZoom();
        if (rightMap.getZoom() !== currentZoom) {
            rightMap.setZoom(currentZoom, { animate: false });
        }
        
        setTimeout(function() {
            syncingZoom = false;
        }, 100);
    });

    // Sync zoom from right to left (if right map becomes interactive)
    rightMap.on('zoomstart', function() {
        syncingZoom = true;
    });
    
    rightMap.on('zoomend', function() {
        if (!syncingZoom) return;
        
        const currentZoom = rightMap.getZoom();
        if (leftMap.getZoom() !== currentZoom) {
            leftMap.setZoom(currentZoom, { animate: false });
        }
        
        setTimeout(function() {
            syncingZoom = false;
        }, 100);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Home setting button click
    homeSettingBtn.addEventListener('click', function() {
        homeSettingMode = !homeSettingMode;
        updateUI();
    });

    // Left map click for setting home location
    leftMap.on('click', function(e) {
        if (homeSettingMode) {
            setHomeLocation(e.latlng);
            homeSettingMode = false;
            updateUI();
        }
    });

    // Handle map resize on window resize
    window.addEventListener('resize', function() {
        setTimeout(function() {
            if (leftMap) leftMap.invalidateSize();
            if (rightMap) rightMap.invalidateSize();
        }, 100);
    });
}

// Set home location
function setHomeLocation(latlng) {
    try {
        homeLocation = latlng;

        // Remove existing marker if any
        if (homeMarker) {
            rightMap.removeLayer(homeMarker);
        }

        // Create a simple red circle marker using DivIcon
        const homeIcon = L.divIcon({
            className: 'custom-home-marker',
            html: '<div style="background-color: #c0152f; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>',
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        });

        // Add marker to right map
        homeMarker = L.marker([latlng.lat, latlng.lng], {
            icon: homeIcon
        }).addTo(rightMap);

        // Set right map view to home location with current zoom
        rightMap.setView([latlng.lat, latlng.lng], leftMap.getZoom());

        // Add popup to marker
        homeMarker.bindPopup('🏠 自宅の位置<br/>緯度: ' + latlng.lat.toFixed(4) + '<br/>経度: ' + latlng.lng.toFixed(4)).openPopup();

        console.log('Home location set:', latlng);
    } catch (error) {
        console.error('Error setting home location:', error);
        showError('自宅位置の設定に失敗しました');
    }
}

// Update UI based on current state
function updateUI() {
    if (homeSettingMode) {
        homeSettingBtn.textContent = '設定をキャンセル';
        homeSettingBtn.classList.add('active');
        statusText.textContent = '比較地図上をクリックして自宅を設定してください';
        statusText.style.color = 'var(--color-error)';
        
        // Change cursor for left map
        const leftMapElement = document.getElementById('map-left');
        if (leftMapElement) {
            leftMapElement.style.cursor = 'crosshair';
        }
    } else {
        homeSettingBtn.textContent = '自宅を設定する';
        homeSettingBtn.classList.remove('active');
        
        if (homeLocation) {
            statusText.textContent = '自宅が設定されました。比較地図で他の地域を探索してください';
            statusText.style.color = 'var(--color-success)';
        } else {
            statusText.textContent = '「自宅を設定する」ボタンを押してから、比較地図上をクリックしてください';
            statusText.style.color = 'var(--color-text-secondary)';
        }
        
        // Reset cursor for left map
        const leftMapElement = document.getElementById('map-left');
        if (leftMapElement) {
            leftMapElement.style.cursor = '';
        }
    }
}

// Show error message
function showError(message) {
    statusText.textContent = message;
    statusText.style.color = 'var(--color-error)';
    setTimeout(function() {
        updateUI();
    }, 3000);
}

// Reset home location (utility function)
function resetHomeLocation() {
    homeLocation = null;
    if (homeMarker && rightMap) {
        rightMap.removeLayer(homeMarker);
        homeMarker = null;
    }
    if (rightMap) {
        rightMap.setView(DEFAULT_COORDS, DEFAULT_ZOOM);
    }
    updateUI();
}

// Get current home location (utility function)
function getHomeLocation() {
    return homeLocation;
}

// Handle visibility change (optimize performance when tab is not active)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page is visible, ensure maps are properly sized
        setTimeout(function() {
            if (leftMap) leftMap.invalidateSize();
            if (rightMap) rightMap.invalidateSize();
        }, 100);
    }
});

// Expose utility functions globally for debugging
window.mapApp = {
    resetHome: resetHomeLocation,
    getHome: getHomeLocation,
    leftMap: function() { return leftMap; },
    rightMap: function() { return rightMap; },
    forceResize: function() {
        if (leftMap) leftMap.invalidateSize();
        if (rightMap) rightMap.invalidateSize();
    }
};