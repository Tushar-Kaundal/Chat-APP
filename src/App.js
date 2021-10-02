import React from 'react';
import { Switch } from 'react-router';
import 'rsuite/dist/rsuite.min.css';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Home from './pages/Home';
import SingIn from './pages/SingIn';
import './styles/main.scss';

function App() {
  return (
    <Switch>
      <PublicRoute path="/signin">
        <SingIn />
      </PublicRoute>
      <PrivateRoute path="/">
        <Home />
      </PrivateRoute>
    </Switch>
  );
}

export default App;
