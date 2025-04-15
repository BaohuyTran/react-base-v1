export const clearLocalStorage = () => {
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("refresh_token");
  window.localStorage.removeItem("persist:root"); // clear state that is saved by zustand persist
};

export const publicEndPoints = ["/"];
