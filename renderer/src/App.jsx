import { Routes, Route, Link } from "react-router-dom";
import Settings from "./pages/Settings";
import POS from "./pages/POS/POS";

import "./App.css";

function App() {
	return (
		<Routes>
			<Route path='/' element={<POS />} />
			<Route path='/settings' element={<Settings />} />
		</Routes>
	);
}

export default App;
