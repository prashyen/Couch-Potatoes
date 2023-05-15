import * as React from "react";
import { useEffect, useState } from "react";
import { Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Thumbnail, Toast, ScrollableTab, Tab, Tabs, Footer, FooterTab, Container, Header, Left, Body, Right, Button, Icon, Title, Card, CardItem, Spinner, View } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { ScrollView } from "react-native-gesture-handler";
import PropTypes from 'prop-types';
import api from '../api'
import { hostURL } from '../api.js'
import AsyncStorage from '@react-native-async-storage/async-storage';
import noImage from '../media/NoImage.jpg';

let getCSRF = function (cookie) {
  return cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

function MainHeader(nav) {
  let removeValue = async () => {
    try {
      await AsyncStorage.removeItem('username')
      await AsyncStorage.removeItem('csrf')
    } catch (e) {
      Toast.show({
        text: "Something Went wrong! Please close the app and reopen it.",
        textStyle: { color: "red" },
        duration: 7000,
        onclose: 'user'
      })
    }
  }
  function logout() {
    api().getCSRFToken(function (response) {
      let newCsrf = getCSRF(response.res.headers.get('set-cookie'))
      api(newCsrf).logout(function (res) {
        if (res.res.status == 200) {
          removeValue();
          nav.navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        } else {
          Toast.show({
            text: "Something Went wrong! Please close the app and reopen it.",
            textStyle: { color: "red" },
            duration: 7000,
            onclose: 'user'
          })
        }
      });
    });
  };
  return (<Header style={{ backgroundColor: '#231F20', height: 50, justifyContent: 'center' }}>
    <Left>
      <Button transparent>
        <Image source={require('../media/potato.png')} />
      </Button>
    </Left>
    <Body>
      <Title style={{ fontSize: 15, color: '#fff' }}>Couch Potatoes</Title>
    </Body>
    <Right>
      <Button hasText transparent onPress={logout}>
        <Icon type="FontAwesome" name="sign-out" style={{ color: '#ffffff', height: 40, marginTop: 15, justifyContent: 'center' }} />
      </Button>
    </Right>
  </Header>
  );
};


export default function UserProfileScreen({ navigation }) {

  const [csrf, setcsrf] = useState();
  const readStorage = async () => {
    const name = await AsyncStorage.getItem('username')
    const token = await AsyncStorage.getItem('csrf')
    if (name == null) {
      navigation.navigate('Login');
    }
    if (token !== null) setcsrf(token);
  }
  readStorage();

  let req = api(csrf);

  const [gridLoading, setGridLoading] = React.useState(false);
  const [profile, setProfile] = React.useState('');
  const [showsWatching, setShowsWatching] = React.useState([]);
  const [showsPlanning, setShowsPlanning] = React.useState([]);
  const [showsCompleted, setShowsCompleted] = React.useState([]);
  const [countersWatching, setCountersWatching] = React.useState([]);
  const [countersPlanning, setCountersPlanning] = React.useState([]);
  const [countersCompleted, setCountersCompleted] = React.useState([]);

  function setCount(showId, type, action, switchStatus) {
    if (type === 'planning') {
      const newCounters = Object.assign([], countersPlanning);
      let index = countersPlanning.findIndex(x => x.showId === showId)
      if (action === 'increment') {
        newCounters[index].currEp++;
      } else {
        newCounters[index].currEp--;
      }
      setCountersPlanning(newCounters.slice());
    } else if (type === 'watching') {
      const newCounters = Object.assign([], countersWatching)
      let index = countersWatching.findIndex(x => x.showId === showId)
      if (action === 'increment') {
        newCounters[index].currEp++;
      } else {
        newCounters[index].currEp--;
      }
      setCountersWatching(newCounters.slice());
    } else {
      const newCounters = Object.assign([], countersCompleted);
      let index = countersCompleted.findIndex(x => x.showId === showId)
      if (action === 'increment') {
        newCounters[index].currEp++;
      } else {
        newCounters[index].currEp--;
      }
      setCountersCompleted(newCounters.slice());
    }
  }
  useEffect(() => {
    countersPlanning.map(counter => {
      let body = { show_id: counter.showId, ep_number: counter.currEp };
      api().getCSRFToken(function (res) {
        var csrf = getCSRF(res.res.headers.get('set-cookie'));
        api(csrf).patchUserEp(body, function (res) {
          updateProfile();
        });
      })
    });
  }, [countersPlanning]);

  useEffect(() => {
    countersWatching.map(counter => {
      let body = { show_id: counter.showId, ep_number: counter.currEp };
      api().getCSRFToken(function (res) {
        var csrf = getCSRF(res.res.headers.get('set-cookie'));
        api(csrf).patchUserEp(body, function (res) {
          updateProfile();
        });
      })
    });
  }, [countersWatching]);

  useEffect(() => {
    countersCompleted.map(counter => {
      let body = { show_id: counter.showId, ep_number: counter.currEp };
      api().getCSRFToken(function (res) {
        var csrf = getCSRF(res.res.headers.get('set-cookie'));
        api(csrf).patchUserEp(body, function (res) {
          updateProfile();
        });
      })
    });
  }, [countersCompleted]);

  const [propic, setProPic] = useState(null);
  useEffect(() => {
    req.getUserPicture(function (res) {
      if (res.res.status === 200) {
        setProPic(hostURL + res.data);
      } else {
        setProPic("");
      }
    });
  }, [])

  useEffect(() => {
    update();
  }, []);

  async function update() {
    setGridLoading(true)
    req.getEpisodeTotal(function (totals) {
      req.getUserShows(function (res) {
        let planning = [];
        let watching = [];
        let completed = [];
        let planningCounter = [];
        let watchingCounter = [];
        let completedCounter = [];
        if (res.data.length == 0) {
          setShowsPlanning(planning.slice())
          setShowsWatching(watching.slice())
          setShowsCompleted(completed.slice());
        } else {
          res.data.map(show => {
            if (show.status === 0) {
              planning.push(show);
              let counter = { showId: show.id, currEp: show.ep_number, episodeTotal: totals.data[show.id] };
              planningCounter.push(counter);
              req.getShowImage(show.id, function (image) {
                let index = planning.findIndex(x => x.id === show.id);
                planning[index].image = image.data;
                planning[index].episodesTotal = totals.data[show.id]
                setShowsPlanning(planning.slice());
              });
            } else if (show.status === 1) {
              watching.push(show);
              let counter = { showId: show.id, currEp: show.ep_number, episodeTotal: totals.data[show.id] };
              watchingCounter.push(counter);
              req.getShowImage(show.id, function (image) {
                let index = watching.findIndex(x => x.id === show.id);
                watching[index].image = image.data;
                watching[index].episodesTotal = totals.data[show.id]
                setShowsWatching(watching.slice());
              })
            } else {
              completed.push(show);
              let counter = { showId: show.id, currEp: show.ep_number, episodeTotal: totals.data[show.id] };
              completedCounter.push(counter);
              req.getShowImage(show.id, function (image) {
                let index = completed.findIndex(x => x.id === show.id);
                completed[index].image = image.data;
                completed[index].episodesTotal = totals.data[show.id]
                setShowsCompleted(completed.slice());
              })
            }

          });
        }
        setGridLoading(false)
        setCountersPlanning(planningCounter.slice());
        setCountersWatching(watchingCounter.slice());
        setCountersCompleted(completedCounter.slice());
      })
    });
    updateProfile();
  }

  function updateProfile() {
    req.getUserProfile(function (response) {
      let wt = response.data.total_watch_time;
      let days = Math.floor(wt / 1440);
      let hours = Math.floor((wt - (days * 1440)) / 60);
      let mins = Math.round(wt % 60);
      response.data.days = days
      response.data.hours = hours
      response.data.mins = mins
      setProfile(response.data)
    })
  }
  const styles = StyleSheet.create({
    epCounterView: {
      height: 100
    },
    epCounterIcon: {
      height: 100,
      width: 30,
      alignItems: 'center'
    },
    epCounterText: {
      height: 100,
      width: 100,
      alignItems: 'center'
    },
    showImage: {
      flex: 1,
      width: null,
      height: 270,
      backgroundColor: '#231F20',
    },
    showBody: {
      margin: 5,
      alignItems: 'center',
      textAlign: 'center'
    },
    showText: {
      fontWeight: 'bold',
      textAlign: 'center'
    },
    profilePic: {
      flex: 1,
      height: 150,
      borderRadius: 200,
      margin: 10
    },
    profileCard: {
      margin: 10
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
    errorMessage: {
      fontSize: 20, flex: 1, alignSelf: 'center', color: 'white'
    },
    tvIcon: {
      fontSize: 100, flex: 1, alignSelf: 'center', color: 'white'
    }
  });

  function EpCounter(props) {
    const { type, showId, currEp, episodeTotal, ...other } = props;
    let currentEp = currEp;
    if (props.type === 'planning' && countersPlanning.length !== 0) {
      let index = countersPlanning.findIndex(x => x.showId === showId);
      if (index != -1) currentEp = countersPlanning[index].currEp;
    } else if (props.type === 'watching' && countersWatching.length !== 0) {
      let index = countersWatching.findIndex(x => x.showId === showId);
      if (index != -1) currentEp = countersWatching[index].currEp;
    } else if (props.type === 'completed' && countersCompleted.length !== 0) {
      let index = countersCompleted.findIndex(x => x.showId === showId);
      if (index != -1) currentEp = countersCompleted[index].currEp;
    }
    return (
      <View style={styles.epCounterView}>
        <Grid style={styles.epCounterView}>
          <Row>
            <Col style={styles.epCounterIcon}>
              {currentEp == 0 ?
                <Icon type="FontAwesome" name="minus" disabled onPress={() => setCount(props.showId, props.type, 'decrement')}>
                </Icon>
                :
                <Icon type="FontAwesome" name="minus" onPress={() => setCount(props.showId, props.type, 'decrement')}>
                </Icon>}
            </Col>
            <Col style={styles.epCounterText}>
              <Text>
                {currentEp} / {episodeTotal == 0 ? 'unknown' : episodeTotal}
              </Text>
            </Col>
            <Col style={styles.epCounterIcon}>
              {currentEp == episodeTotal && episodeTotal != 0 ? <Icon type="FontAwesome" name="plus" disabled onPress={() => setCount(props.showId, props.type, 'increment')}>
              </Icon>
                :
                <Icon type="FontAwesome" name="plus" onPress={() => setCount(props.showId, props.type, 'increment')}>
                </Icon>}
            </Col>
          </Row>
        </Grid>
      </View>
    );
  }

  EpCounter.propTypes = {
    type: PropTypes.any.isRequired,
    showId: PropTypes.any.isRequired,
    currEp: PropTypes.any.isRequired,
  };

  function viewShow(show_id) {
    navigation.navigate('ShowScreen', { show_id: show_id })
  }

  function markCompleted(showId, type) {
    let show = null;
    if (type === 'planning') {
      let index = showsPlanning.findIndex(x => x.id === showId);
      if (index != -1) {
        show = showsPlanning[index]
        showsPlanning.splice(index, 1)
        setShowsPlanning(showsPlanning.splice())
      }
    } else if (type === 'watching') {
      let index = showsWatching.findIndex(x => x.id === showId);
      if (index != -1) {
        show = showsWatching[index]
        showsWatching.splice(index, 1)
        setShowsWatching(showsWatching.splice())
      }
    }
    if (show.status !== 'Continuing') {
      let reqBody = { show_id: showId, status: 2 };
      api().getCSRFToken(function (res) {
        var csrf = getCSRF(res.res.headers.get('set-cookie'));
        api(csrf).patchUserShowWatchStatus(reqBody, function (response) {
          update();
        });
      });
    }
  }

  function ShowCard(props) {
    const { type, id, title, currEp, episodeTotal, ...other } = props;

    return (
      <Card>
        <CardItem cardBody>
          <Left >

            <TouchableOpacity style={{ flex: 1, activeOpacity: 1.0 }} onPress={() => viewShow(id)}>
              {props.img ?
                <Image fadeDuration={0}
                  resizeMethod="scale"
                  resizeMode="cover" source={{ uri: props.img }} style={styles.showImage} />
                :
                <Image fadeDuration={0}
                  resizeMethod="scale"
                  resizeMode="cover" source={noImage} style={styles.showImage} />}
            </TouchableOpacity>
          </Left>
          <Body style={styles.showBody} >
            <Text style={styles.showText}>{props.title}</Text>
            <Text>Season no#</Text>
            <EpCounter type={props.type} showId={props.id} currEp={props.currEp} episodeTotal={episodeTotal} />
            {type != 'completed' ? <Button full block light style={{ marginBottom: 15 }} onPress={() => markCompleted(id, type)}>
              <Text style={{ fontSize: 15 }}> Mark Completed </Text>
            </Button> : null}
            <Button full block light danger onPress={() => removeShow(id, type)}><Icon type="FontAwesome" name="trash">
              <Text style={{ fontSize: 15 }}> Remove Show </Text> </Icon>
            </Button>
          </Body>
        </CardItem>
      </Card>
    );
  }

  ShowCard.propTypes = {
    type: PropTypes.any.isRequired, //planning, watching, completed
    id: PropTypes.any.isRequired,
    title: PropTypes.any.isRequired,
    currEp: PropTypes.any.isRequired,
  };

  function viewHome() {
    navigation.navigate('Home', { csrf: csrf })
  }
  let getCSRF = function (cookie) {
    return cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  }

  function removeShow(showId, type) {
    setGridLoading(true);
    api().getCSRFToken(function (res) {
      let newCsrf = getCSRF(res.res.headers.get('set-cookie'))
      api(newCsrf).deleteShowStatus(showId, function (res) {
        if (res.res.status !== 200) {
          Toast.show({
            text: res.data,
            textStyle: { color: "red" },
            duration: 5000
          })
        }
        else {
          if (type === 'planning') {
            let index = showsPlanning.findIndex(x => x.id === showId);
            if (index != -1) {
              showsPlanning.splice(index, 1)
              setShowsPlanning(showsPlanning.splice())
            }
          } else if (type === 'watching') {
            let index = showsWatching.findIndex(x => x.id === showId);
            if (index != -1) {
              showsWatching.splice(index, 1)
              setShowsWatching(showsWatching.splice())
            }
          } else if (type === 'completed') {
            let index = showsCompleted.findIndex(x => x.id === showId);
            if (index != -1) {
              showsCompleted.splice(index, 1)
              setShowsCompleted(showsCompleted.splice())
            }
          }
          update();
        }

      });
    });
  }
  return (
    <SafeAreaProvider>
      <Container>
        <MainHeader navigation={navigation} />
        <ScrollView>
          <Card style={styles.profileCard}>
            {profile && propic != null ?
              <CardItem cardBody>
                <Left style={{ justifyContent: 'center' }}>
                  {propic == "" ?
                    <Icon style={{ fontSize: 180, justifyContent: 'center' }} name="person-circle-outline"></Icon>
                    :
                    <Thumbnail large source={{ uri: propic }} style={styles.profilePic} />}
                </Left>
                <Body style={styles.showBody} >
                  <Text>{profile.email}</Text>
                  <Text>{profile.first_name} {profile.last_name}</Text>
                  <Text>Total Watch Time:</Text>
                  <Text>{profile.days} days</Text>
                  <Text>{profile.hours} hours</Text>
                  <Text>{profile.mins} mins</Text>
                </Body>
              </CardItem>
              :
              <Spinner color='black' />
            }
          </Card>
          {!gridLoading ?
            (showsWatching.length == 0 && showsCompleted.length == 0 && showsPlanning.length == 0 ?
              <View>
                <Icon name="tv-outline" style={{ fontSize: 100, flex: 1, alignSelf: 'center' }} />
                <Text style={{ fontSize: 20, flex: 1, alignSelf: 'center' }}> No Shows found, start tracking!</Text>
              </View>
              :
              <Tabs renderTabBar={() => <ScrollableTab style={styles.scrollTab} />} style={{ marginBottom: 0 }} tabStyle={{ backgroundColor: '#231F20', color: '#231F20' }}>
                <Tab heading="All" style={styles.tab} tabStyle={styles.tab} textStyle={styles.tabText} activeTabStyle={styles.tab} activeTextStyle={styles.tabText} >
                  {showsPlanning.map(show => {
                    return <ShowCard id={show.name} type='planning' id={show.id} img={show.image} title={show.name} currEp={show.ep_number} episodeTotal={show.episodesTotal} />
                  })}
                  {showsWatching.map(show => {
                    return <ShowCard id={show.name} type='watching' id={show.id} img={show.image} title={show.name} currEp={show.ep_number} episodeTotal={show.episodesTotal} />
                  })}
                  {showsCompleted.map(show => {
                    return <ShowCard id={show.name} type='completed' id={show.id} img={show.image} title={show.name} currEp={show.ep_number} episodeTotal={show.episodesTotal} />
                  })}
                </Tab>
                <Tab heading="Plan to watch" style={styles.tab} tabStyle={styles.tab} textStyle={styles.tabText} activeTabStyle={styles.tab} activeTextStyle={styles.tabText}>
                  {showsPlanning.length == 0 ?
                    <View>
                      <Icon name="tv-outline" style={styles.tvIcon} />
                      <Text style={styles.errorMessage}> No Planned Shows</Text>
                    </View> : null}
                  {showsPlanning.map(show => {
                    return <ShowCard id={show.name} type='planning' id={show.id} img={show.image} title={show.name} currEp={show.ep_number} episodeTotal={show.episodesTotal} />
                  })}
                </Tab>
                <Tab heading="Watching" style={styles.tab} tabStyle={styles.tab} textStyle={styles.tabText} activeTabStyle={styles.tab} activeTextStyle={styles.tabText}>
                  {showsWatching.length == 0 ?
                    <View>
                      <Icon name="tv-outline" style={styles.tvIcon} />
                      <Text style={styles.errorMessage}> No Shows Currently Watched</Text>
                    </View> : null}
                  {showsWatching.map(show => {
                    return <ShowCard id={show.name} type='watching' id={show.id} img={show.image} title={show.name} currEp={show.ep_number} episodeTotal={show.episodesTotal} />
                  })}
                </Tab>
                <Tab heading="Completed" style={styles.tab} tabStyle={styles.tab} textStyle={styles.tabText} activeTabStyle={styles.tab} activeTextStyle={styles.tabText}>
                  {showsCompleted.length == 0 ?
                    <View>
                      <Icon name="tv-outline" style={styles.tvIcon} />
                      <Text style={styles.errorMessage}> No Completed Shows</Text>
                    </View> : null}
                  {showsCompleted.map(show => {
                    return <ShowCard id={show.name} type='completed' id={show.id} img={show.image} title={show.name} currEp={show.ep_number} episodeTotal={show.episodesTotal} />
                  })}
                </Tab>
              </Tabs>) :
            <Spinner color="black" />
          }
        </ScrollView>
        <Footer >
          <FooterTab style={styles.footer}>
            <Button onPress={viewHome}>
              <Icon name="search" style={styles.inactiveFooterIcon} />
            </Button>
            <Button active style={styles.activeFooterIcon}>
              <Icon active name="person" />
            </Button>
          </FooterTab>
        </Footer>
      </Container>

    </SafeAreaProvider>
  );
}
