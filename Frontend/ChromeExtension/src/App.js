import {
  BrowserRouter,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import Cookies from 'js-cookie';
import Login from './login/login';
import ShowCounter from './account/showCounter';

function App() {
// {Cookies.get('username') !== undefined?<Redirect to="/" />:<Login/>}
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          {Cookies.get('username') === undefined?<Redirect to="/login" />:<ShowCounter/>}
        </Route>
        <Route path="/login">
              <Login/>
        </Route>
        <Route path="/account">
              <ShowCounter/>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
