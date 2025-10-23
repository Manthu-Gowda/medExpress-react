import "./App.scss";
import RouterComponent from "./app/routes/RouterComponent";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {

  return (
    <div className="App">
      <RouterComponent />
     <ToastContainer theme="colored" position="top-right" autoClose={5000} />
    </div>
  );
}

export default App;
