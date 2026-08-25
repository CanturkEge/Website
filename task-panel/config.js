const localTaskPanel = ["localhost", "127.0.0.1"].includes(location.hostname);
window.TASK_PANEL_CONFIG = {
  API_BASE_URL: localTaskPanel
    ? "http://localhost:5000"
    : "https://BURAYA-RENDER-ADRESIN.onrender.com"
};
