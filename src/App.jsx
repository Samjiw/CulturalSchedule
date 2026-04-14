import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Activity from './pages/Activity.jsx';
import Calendarx from './pages/Calendar.jsx';

const router = createBrowserRouter([

  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/activity",
    element: <Activity />,
  },
  {
    path: "/calendar",
    element: <Calendarx />,
  }
]);

function App() {
  return <RouterProvider router={router} baseName="/CulturalSchedule" />;
}

export default App;
