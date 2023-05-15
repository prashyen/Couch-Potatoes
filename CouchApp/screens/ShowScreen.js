import * as React from "react";
import { useEffect, useState } from "react";
import { Text, Image, StyleSheet } from "react-native";
import { Toast, Container, Header, Left, Body, Right, Button, Icon, Title, Spinner, Card, CardItem, Footer, FooterTab, Tabs, Tab, ScrollableTab, View } from 'native-base';
import PropTypes from 'prop-types';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import api from '../api'
import { Col, Row, Grid } from 'react-native-easy-grid';
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from '@react-native-async-storage/async-storage';
import noImage from '../media/NoImage.jpg';
import { WebView } from 'react-native-webview';
import { AirbnbRating } from 'react-native-ratings';

function MainHeader() {
  return (<Header style={{ backgroundColor: '#231F20', height: 50 }}>
    <Left>
      <Button transparent>
        <Image source={require('../media/potato.png')} />
      </Button>
    </Left>
    <Body>
      <Title style={{ fontSize: 15 }}>Couch Potatoes</Title>
    </Body>
  </Header>
  );
};

let getCSRF = function (cookie) {
  return cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

function CharCard(props) {
  const { charName, actorName, image, ...other } = props;
  return (
    <Card>
      <CardItem cardBody>
        <Image source={{ uri: props.image }} style={{ height: 200, width: null, flex: 1,  resizeMode: 'stretch' }} />
      </CardItem>
      <CardItem>
        <Body>
          <Text>
            {props.charName}
          </Text>
          <Text>
            {props.actorName}
          </Text>
        </Body>
      </CardItem>
    </Card>
  );
};

CharCard.propTypes = {
  charName: PropTypes.any.isRequired,
  actorName: PropTypes.any.isRequired,
  image: PropTypes.any.isRequired,
};



export default function showScreen({ route, navigation }) {

  const { show_id } = route.params;
  const [username, setusername] = useState();
  const [csrf, setcsrf] = useState();
  const readStorage = async () => {
    const name = await AsyncStorage.getItem('username')
    const token = await AsyncStorage.getItem('csrf')
    if (name == null) {
      navigation.navigate('Login');
    } else {
      setusername(name);
    }
    if (token !== null) setcsrf(token);
  }
  readStorage();
  let showId = show_id;
  let req = api(csrf);

  const [statusLoading, setStatusLoading] = React.useState(false);
  const [canDel, setCanDel] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [genres, setGenres] = React.useState([]);
  const [totalSeasons, setTotalSeasons] = useState('');
  const [poster, setPoster] = React.useState('');
  const [totalEp, setTotalEp] = React.useState('');
  const [avgRuntime, setRuntime] = React.useState('');
  const [lang, setLang] = React.useState('');
  const [airdays, setAirdays] = React.useState([]);
  const [firstAired, setFirstAired] = React.useState('');
  const [nextAiring, setNextAiring] = React.useState('');
  const [lastAired, setLastAired] = React.useState('');
  const [characters, setCharacters] = React.useState([]);
  const [currentStatus, setCurrentStatus] = React.useState({ planning: false, watching: false, completed: false });
  const [seriesStatus, setSeriesStatus] = useState('');
  const [trailer, setTrailer] = useState([]); // [0] Title [1] embed id

  useEffect(() => {
    setStatusLoading(true);
    api().getCSRFToken(function (response) {
      let newCsrf = getCSRF(response.res.headers.get('set-cookie'))
      api(newCsrf).getShowStatus(showId, function (res) {
        switch (res.data.watch_status) {
          case 0:
            setCurrentStatus({ planning: true, watching: false, completed: false });
            setCanDel(true);
            break;
          case 1:
            setCurrentStatus({ planning: false, watching: true, completed: false });
            setCanDel(true);
            break;
          case 2:
            setCurrentStatus({ planning: false, watching: false, completed: true });
            setCanDel(true);
            break;
          default:
            setCurrentStatus({ planning: false, watching: false, completed: false });
            setCanDel(false);
            break;
        }
        setStatusLoading(false);
      })
    })

    req.getShowInfo(showId, function (res) {

      let chars = [];
      let i = 0;
      while (res.data.tvdb.characters.length > 0 && i < 20 && res.data.tvdb.characters[i].name !== null) {
        let char = [];
        char.push(res.data.tvdb.characters[i].name);
        char.push(res.data.tvdb.characters[i].person.name);
        if (res.data.tvdb.characters[i].image !== null) {
          char.push(res.data.tvdb.characters[i].image);
        } else {
          char.push('https://artworks.thetvdb.com' + res.data.tvdb.characters[i].person.image);
        }
        chars.push(char);
        i++;
      };
      chars = chars.reduce((r, k, i) => {
        return (i % 2 == 1 ? r[r.length - 1].push(k) : r.push([k])) && r;
      }, []);
      setCharacters(chars);

      let genres = [];
      res.data.tvdb.genres.map((genre => {
        genres.push(genre.name);
      }));
      setGenres(genres);

      let airdays = [];
      let obj = res.data.tvdb.airsDays;
      for (var day in obj) {
        if (obj[day]) {
          airdays.push(day.charAt(0).toUpperCase() + day.slice(1))
        };
      }
      setAirdays(airdays);
      setLang(res.data.tvdb.originalLanguage.toUpperCase());
      setPoster(res.data.tvdb.image);
      setFirstAired(res.data.tvdb.firstAired);
      if (res.data.tvdb.status.name === 'Continuing') {
        setSeriesStatus('Ongoing');
      } else {
        setSeriesStatus(res.data.tvdb.status.name);
      }

      if (res.data.tvdb.status.name === 'Ended') {
        setLastAired(res.data.tvdb.lastAired);
        setNextAiring("[Series ended]");
      } else {
        setNextAiring(res.data.tvdb.nextAired);
      }
      if (res.data.cpdb !== null) {
        setTitle(res.data.cpdb.name);
        setTotalEp(res.data.cpdb.num_episodes);
        setTotalSeasons(res.data.tvdb.seasons.length);
        setRuntime(Math.round(res.data.cpdb.avg_runtime));
      } else {
        setTitle(res.data.tvdb.name);
      }

      if (res.data.tvdb.trailers.length !== 0) {
        let trailerInfo = [];
        trailerInfo.push(res.data.tvdb.trailers[0].name);
        trailerInfo.push(res.data.tvdb.trailers[0].url.split('=')[1]);
        setTrailer(trailerInfo);
      }
    });

  }, []);

  function removeShow() {
    setStatusLoading(true);
    api().getCSRFToken(function (res) {
      let newCsrf = getCSRF(res.res.headers.get('set-cookie'))
      api(newCsrf).deleteShowStatus(show_id, function (res) {

        setStatusLoading(false);
        if (res.res.status !== 200) {
          Toast.show({
            text: 'Failed, Please login in again',
            textStyle: { color: "red" },
            duration: 5000
          })
        } else {
          setCurrentStatus({ planning: false, watching: false, completed: false });
          setCanDel(false);
        }
      });
    });
  }
  function updateStatus(status) {
    if (status !== '') {
      let watchStatus;
      let newStatus
      if (status == 'Planning') {
        watchStatus = 0;
        newStatus = { planning: true, watching: false, completed: false }
      } else if (status === 'Watching') {
        watchStatus = 1;
        newStatus = { planning: false, watching: true, completed: false }
      } else if (status === 'Completed') {
        watchStatus = 2;
        newStatus = { planning: false, watching: false, completed: true }
      }

      setStatusLoading(true);
      api().getCSRFToken(function (res) {
        let newCsrf = getCSRF(res.res.headers.get('set-cookie'))
        let body = { user: username, show_id: showId, status: watchStatus }
        api(newCsrf).postUserShowList(body, function (res) {

          setStatusLoading(false);
          if (res.res.status !== 201) {
            Toast.show({
              text: 'Failed, Please login in again',
              textStyle: { color: "red" },
              duration: 5000
            })
          } else {
            setCurrentStatus(newStatus);
            setCanDel(true);
          }
          if (res.data === 'Show already exists in user list') {
            let reqBody = { show_id: showId, status: watchStatus }
            api(newCsrf).patchUserShowWatchStatus(reqBody, function (response) {});
          };
        });
      });

    }
  };

  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    req.getReviews(showId, function (res) {
      setReviews(res.data);
    });
  }, []);

  const styles = StyleSheet.create({
    title: {
      color: 'black',
      paddingLeft: 20,
      alignSelf: 'center',
      marginTop: 10
    },
    grid: {
      flex: 1,
    },
    row: {
      flex: 1,
      margin: 5
    },
    showImage: {
      flex: 1,
      width: null,
      height: 220,
      resizeMode: 'stretch'
    },
    showBody: {
      margin: 5,
      alignItems: 'center',
      textAlign: 'center'
    },
    showText: {
      margin: 5,
      textAlign: 'center'
    },
    showBoldedText: {
      fontWeight: 'bold'
    },
    statusBtn: {
      flex: 1,
      margin: 1
    },
    castTitle: {
      flex: 1,
      color: 'black',
      paddingLeft: 20
    },
    castMsg: {
      flex: 1,
      color: 'white',
      paddingLeft: 20
    },
    footer: {
      backgroundColor: '#231F20',
      color: '#ffffff'
    },
    activeFooterIcon: {
      backgroundColor: '#FFE0B7',
      color: '#111111'
    },
    inactiveFooterIcon: {
      color: '#ffffff'
    },
    tab: {
      backgroundColor: '#231F20'
    },
    tabText: {
      color: '#fff'
    },
    scrollTab: {
      marginBottom: 0, backgroundColor: '#231F20', color: '#231F20'
    },
    reviewView: {
      width: 150,
      padding: 5
    },
    reviewCard: {
      flexDirection: 'row',
      justifyContent: 'center'
    },
    rating: {
      paddingVertical: 10,
      width: 60
    },
    comment: {
      padding: 5,
      width: 200
    },
    errorMessage: {
      fontSize: 20,
      flex: 1,
      alignSelf: 'center',
      color: 'white'
    },
    tvIcon: {
      fontSize: 100,
      flex: 1,
      alignSelf: 'center',
      color: 'white'
    }
  });

  function viewProfile() {
    navigation.navigate('UserProfile', { csrf: csrf })
  }

  function viewHome() {
    navigation.navigate('Home', { csrf: csrf })
  }
  return (
    <SafeAreaProvider>
      <Container>
        <MainHeader />
        {title !== '' ?
          (
            <ScrollView>
              <Title style={styles.title}>{title}</Title>
              <Grid style={styles.grid}>
                <Row style={styles.row} >
                  <Col  >
                    <Card>
                      <CardItem cardBody>
                        <Left>
                          {poster !== null ?
                            <Image source={{ uri: poster }} style={styles.showImage} />
                            :
                            <Image source={noImage} style={styles.showImage} />
                          }
                        </Left>
                        <Body style={styles.showBody} >
                          <Text style={styles.showBoldedText}> Genre : </Text>
                          <Text style={styles.showText}>{genres.join(', ')}</Text>
                          <Text style={styles.showBoldedText}> Language: </Text>
                          <Text> {lang} </Text>
                        </Body>
                      </CardItem>
                    </Card>
                  </Col>
                </Row>
              </Grid>
              <Grid style={styles.grid}>
                <Row style={styles.row} >
                  <Col  >
                    <Card>
                      <CardItem cardBody>
                        <Body style={styles.showBody}>
                          <Text > Total Number of Episodes: {totalEp} </Text>
                          <Text > Episode Duration: {avgRuntime != '' ? avgRuntime + " mins" : 'N/A'}  </Text>
                          <Text > Aired on {airdays != '' ? airdays.join(', ') : 'N/A'} </Text>
                          <Text > First aired on {firstAired != '' ? firstAired : 'N/A'} </Text>
                          <Text > Next airing on {nextAiring != '' ? nextAiring : 'N/A'} </Text>
                          <Text > Last aired on {lastAired != '' ? lastAired : 'N/A'} </Text>
                        </Body>
                      </CardItem>
                    </Card>
                  </Col>
                </Row>
              </Grid>
              {statusLoading ?
                <Spinner color="black" /> :
                <Grid style={styles.grid}>
                  <Row style={styles.row} >
                    <Col style={styles.statusBtn}>
                      <Button full block light success={currentStatus.planning} onPress={() => updateStatus('Planning')}><Text> Planning </Text></Button>
                    </Col>
                    <Col style={styles.statusBtn} >
                      <Button full block light success={currentStatus.watching} onPress={() => updateStatus('Watching')}><Text> Watching </Text></Button>
                    </Col>
                    <Col style={styles.statusBtn} >
                      <Button full block light success={currentStatus.completed} onPress={() => updateStatus('Completed')}><Text> Completed </Text></Button>
                    </Col>
                  </Row>
                  {canDel ?
                    <Row style={styles.row} >
                      <Col style={styles.statusBtn}>
                        <Button full block light danger onPress={() => removeShow()}>{statusLoading ? <Spinner color="black" /> : <Text> Remove Show </Text>}</Button>
                      </Col>
                    </Row> : null
                  }
                </Grid>}
              <Tabs renderTabBar={() => <ScrollableTab tabsContainerStyle={styles.scrollTab} />} style={styles.scrollTab} >
                <Tab heading="Cast" style={styles.tab} tabStyle={styles.tab} textStyle={styles.tabText} activeTabStyle={styles.tab} activeTextStyle={styles.tabText} >
                  <Grid>
                    {characters.length == 0 ? <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Icon name="tv-outline" style={styles.tvIcon} />
                      <Text style={styles.errorMessage}>Cast is currently unavailable</Text>
                    </View> : null}
                    {characters.map((pair, i) => {
                      return (
                        <Row key={i} >
                          {characters[i].map(character => {
                            return (
                              <Col>
                                <CharCard charName={character[0]}
                                  actorName={character[1]}
                                  image={character[2]} />
                              </Col>
                            )
                          }
                          )}
                        </Row>);
                    })}
                  </Grid>
                </Tab>
                <Tab heading="Trailer" style={styles.tab} tabStyle={styles.tab} textStyle={styles.tabText} activeTabStyle={styles.tab} activeTextStyle={styles.tabText} >
                  {trailer.length !== 0 ?
                    <Card  >
                      <CardItem>
                        <Text>{trailer[0]}</Text>
                      </CardItem>
                      <CardItem style={{ height: 280 }} >
                        <WebView
                          allowsFullscreenVideo
                          allowsInlineMediaPlayback
                          mediaPlaybackRequiresUserAction
                          source={{ uri: `https://www.youtube.com/embed/${trailer[1]}` }}
                        />
                      </CardItem>
                    </Card>
                    :
                    <View>
                      <Icon name="tv-outline" style={styles.tvIcon} />
                      <Text style={styles.errorMessage}>Sorry, there are no trailers</Text>
                    </View>
                  }
                </Tab>
                <Tab heading="Reviews" style={styles.tab} tabStyle={styles.tab} textStyle={styles.tabText} activeTabStyle={styles.tab} activeTextStyle={styles.tabText} >
                  <View>
                    {reviews.length == 0 ?
                      <View>
                        <Icon name="tv-outline" style={styles.tvIcon} />
                        <Text style={styles.errorMessage}>Sorry, there are no reviews</Text>
                      </View>
                      :
                      reviews.map(review => {
                        return (
                          <Card>
                            <CardItem header bordered>
                              <Body>
                                <Text style={styles.showBoldedText} > {review.username} </Text>
                                <Text style={styles.showBoldedText}>Last Modified on {new Date(review.last_modified).toLocaleDateString()} </Text>
                              </Body>
                            </CardItem>
                            <CardItem cardBody style={styles.reviewCard}>
                              <View style={styles.reviewView}>
                                <AirbnbRating
                                  showRating
                                  isDisabled={true}
                                  defaultRating={review.rating}
                                  count={5}
                                  reviewSize={20}
                                  size={20}
                                  starContainerStyle={{ width: 55 }}
                                  style={styles.rating}
                                /></View>
                              <Text style={styles.comment}> {review.comment} </Text>

                            </CardItem>
                          </Card>)
                      }
                      )}
                  </View>
                </Tab>
              </Tabs>

            </ScrollView>) :
          <ScrollView><Spinner color='black' /></ScrollView>
        }
        <Footer >
          <FooterTab style={styles.footer}>
            <Button active onPress={viewHome} style={styles.activeFooterIcon}>
              <Icon active name="search" />
            </Button>
            <Button onPress={viewProfile}>
              <Icon name="person" style={styles.inactiveFooterIcon} />
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    </SafeAreaProvider>
  );
}
