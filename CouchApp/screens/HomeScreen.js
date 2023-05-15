import * as React from "react";
import { Text, Image, StyleSheet } from "react-native";
import { Footer, FooterTab, Card, CardItem, Container, Header, Left, Body, Button, Icon, Title, Input, Item, Spinner } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from "react";
import api from '../api'
import { Col, Row, Grid } from 'react-native-easy-grid';
import { ScrollView } from "react-native-gesture-handler";
import noImage from '../media/NoImage.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AirbnbRating } from 'react-native-ratings';

export default function HomeScreen({ navigation }) {
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
  const [popShows, setPopShows] = useState();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchedShows, setSearchedShows] = React.useState([]);
  let req = api(csrf);

  useEffect(() => {
    req.getPopularShows(function (resp) {
      let shows = resp.data;
      resp.data.map((show) => {
        req.getShowImage(show.show_id, (res) => {
          let index = shows.findIndex(x => x.show_id === show.show_id)
          shows[index].image = res.data;
          setPopShows(shows.slice());
        });
        return 1;
      });
    });
  }, []);

  function search(e) {
    setSearchQuery(e.nativeEvent.text)
    req.search(e.nativeEvent.text, function (res) {
      let results = res.data.reduce((r, k, i) => {
        return (i % 2 == 1 ? r[r.length - 1].push(k) : r.push([k])) && r;
      }, []);
      setSearchedShows(results.slice())
    })
  }

  function viewShow(show_id) {
    navigation.navigate('ShowScreen', { show_id: show_id })
  }

  function viewProfile() {
    navigation.navigate('UserProfile')
  }

  const styles = StyleSheet.create({
    header: {
      backgroundColor: '#231F20'
    },
    icon: {
      flex: 1,
      height: 20,
      resizeMode: 'contain'
    },
    title: {
      color: 'black',
      paddingLeft: 20
    },
    row: {
      margin: 0
    },
    col: {
      height: 270,
      marginTop: 3,
      marginBottom: 3
    },
    showImage: {
      flex: 1,
      width: null,
      height: 220,
      resizeMode: 'stretch'
    },
    showBody: {
      alignItems: 'center',
      textAlign: 'center'
    },
    showText: {
      width: '100%',
      textAlign: 'center'
    },
    popRow: {
      margin: 10
    },
    popCol: {
      height: 220,
      marginTop: 3,
      marginBottom: 3
    },
    popShowBody: {
      margin: 5,
      alignItems: 'center',
      textAlign: 'center'
    },
    popShowText: {
      fontWeight: 'bold',
      textAlign: 'center'
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
    }
  });

  return (
    <SafeAreaProvider>
      <Container>
        <Header searchBar rounded style={styles.header}>
          <Item>
            <Icon name="ios-search" />
            <Input placeholder="Search for shows"
              onSubmitEditing={search}
            />
            <Icon>
              <Image
                style={styles.icon}
                source={require('../media/potato.png')} />
            </Icon>
          </Item>
        </Header>
        <ScrollView>
          <Title style={styles.title}>{searchQuery !== '' ? 'Results for \"' + searchQuery + '\"' : 'Most Popular'}</Title>
          <Grid>
            {searchQuery !== '' ?
              (searchedShows ?
                searchedShows.map((x, index) => {
                  return (
                    <Row
                      key={index}
                      style={styles.row}
                    >
                      {searchedShows[index].map((show, i) => {
                        return (
                          <Col
                            onPress={() => viewShow(show.tvdb_id)}
                            style={styles.col}
                            key={i}
                          >
                            <Card>
                              <CardItem cardBody>
                                {show.image_url !== "" ?
                                  <Image source={{ uri: show.image_url }} style={styles.showImage} /> :
                                  <Image source={noImage} style={styles.showImage} />
                                }
                              </CardItem>
                              <CardItem>
                                <Body style={styles.showBody} >
                                  <Text numberOfLines={1} style={styles.showText}>{show.name}</Text>
                                </Body>
                              </CardItem>
                            </Card>
                          </Col>);
                      })}
                    </Row>);
                }) : <p>No Shows found</p>)
              :
              (popShows ? popShows.map((show, index) => {
                return (
                  <Row
                    key={index}
                    style={styles.popRow}>
                    <Col on onPress={() => viewShow(show.show_id)} style={styles.popCol}>
                      <Card>
                        <CardItem cardBody>
                          <Left>
                            <Image source={{ uri: show.image }} style={styles.showImage} />
                          </Left>
                          <Body style={styles.popShowBody} >
                            <Text style={styles.popShowText}>{show.name}</Text>

                            <AirbnbRating
                              showRating
                              isDisabled={true}
                              defaultRating={show.rating}
                              count={5}
                              reviewSize={20}
                              size={20}
                              starContainerStyle={{ width: 35 }}
                              style={{ paddingVertical: 10 }}
                            />
                            <Text>Avg Length: {show.avg_runtime}</Text>
                            <Text>Episode Count: {show.num_episodes}</Text>
                          </Body>
                        </CardItem>
                      </Card>
                    </Col>
                  </Row>);
              })
                :
                <Row>
                  <Col >
                    <Spinner color='black' />
                  </Col>
                </Row>
              )
            }
          </Grid>
        </ScrollView>
        <Footer >
          <FooterTab style={styles.footer}>
            <Button active style={styles.activeFooterIcon}>
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
