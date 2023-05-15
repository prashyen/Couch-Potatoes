
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import { theme } from './mainStyles';
import { LoginHeader, Footer } from './header';


const useStyles = makeStyles((theme) => ({
    root: {
      padding: theme.spacing(5),
      minHeight: '100vh',
      top: '0px',
      position: 'inherit',
    }
  }));

export default function Credits() {
    const classes = useStyles();

    return (
        <ThemeProvider theme={theme}>
            <LoginHeader />
            <div className={classes.root}>
              <h1>Credits</h1>
              <h2>Icons</h2>
              <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
              <h2>Background Image</h2>
              <div>
              "The 48 movies I saw in 2015 :)" by ratexla (protected by Pixsy) is
              licensed with CC BY-NC-ND 2.0. To view a copy of this license,
              visit https://creativecommons.org/licenses/by-nc-nd/2.0/
              </div>
              <h2>TV Database</h2>
              <div>
                Information provided by TheTVDB.com. Please consider supporting <a href="https://www.thetvdb.com/subscribe">them</a>.
              </div>
            </div>
            <Footer />
    </ThemeProvider>
    )

}
