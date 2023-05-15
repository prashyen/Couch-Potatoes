import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { Left, Button, Body, Title, Container, Header, Content, List, ListItem, Text } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScrollView } from "react-native-gesture-handler";
const styles = StyleSheet.create({
    header: {
        backgroundColor: '#231F20',
        height: 50
    },
    title: {
        fontSize: 15
    },
    container: {
        backgroundColor: '#231F20', flex: 1
    },
    text: {
        color: "white"
    },
    listHeader: {
        color: "white",
        textDecorationLine: 'underline'
    }
});
function MainHeader() {
    return (
        <Header style={styles.header}>
            <Left>
                <Button transparent>
                    <Image source={require('../media/potato.png')} />
                </Button>
            </Left>
            <Body>
                <Title style={styles.title}>Couch Potatoes</Title>
            </Body>
        </Header>
    );
};
export default function CreditsScreen({ navigation }) {


    return (
        <SafeAreaProvider>
            <Container>
                <MainHeader />
                <Content contentContainerStyle={styles.container}>
                    <ScrollView>
                        <List>
                            <ListItem last>
                                <Text style={styles.listHeader}>CREDITS</Text>
                            </ListItem>
                            <ListItem itemHeader first>
                                <Text style={styles.text}>ICONS</Text>
                            </ListItem>
                            <ListItem last>
                                <Text style={styles.text}>Icons made by Freepik from www.flaticon.com</Text>
                            </ListItem>
                            <ListItem itemHeader>
                                <Text style={styles.text}>IMAGE PICKER</Text>
                            </ListItem>
                            <ListItem last>
                                <Text style={styles.text}>Image Picker Code from https://docs.expo.io/versions/latest/sdk/imagepicker/</Text>
                            </ListItem>
                        </List>
                    </ScrollView>
                </Content>
            </Container>
        </SafeAreaProvider>
    );
}
