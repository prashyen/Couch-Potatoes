import {
  BrowserRouter,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import Cookies from 'js-cookie';
import Login from './login/login';
import Signup from './login/signup';
import ShowProfile from './show/showProfile';
import UserProfile from './user/userProfile';
import Dashboard from './dashboard/dashboard';
import Credits from './credits';
import { SnackbarProvider } from "notistack";

function App() {

  return (
    <SnackbarProvider>
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          {Cookies.get('username') === undefined?<Redirect to="/login" />:<Dashboard/>}
        </Route>
        <Route path="/login">
              {Cookies.get('username') !== undefined?<Redirect to="/" />:<Login/>}
        </Route>
        <Route path="/signup">
              {Cookies.get('username') !== undefined?<Redirect to="/" />:<Signup/>}
        </Route>
        <Route path="/show/:id">
              <ShowProfile/>
        </Route>
        <Route path="/user">
              <UserProfile/>
        </Route>
        <Route path="/credits">
              <Credits/>
        </Route>
      </Switch>
    </BrowserRouter>
    </SnackbarProvider>
  );
}

export default App;
