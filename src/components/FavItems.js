import React from 'react'
import { FlatList, RefreshControl, StyleSheet } from 'react-native'
import { Container, Text, Button } from 'native-base'
import FavArticle from './FavArticle'
import { Actions } from 'react-native-router-flux'

export default class FavItems extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      refreshing: false
    }
  }

  componentDidMount () {
    if (this.props.login.isLogin) {
      this.props.getFavArticlesFromApi(this.props.index, this.props.login.userData.urlName, this.props.data.offset)
    }
  }

  onRefreshHandler () {
    this.setState({refreshing: true})
    this.props.clearArticles(this.props.index).then(() => {
      setTimeout(() => {
        this.props.getFavArticlesFromApi(this.props.index, this.props.login.userData.urlName, this.props.data.offset).then(() => {
          this.setState({refreshing: false})
        })
      }, 2000)
    })
  }

  render () {
    if (this.props.login.isLogin) {
      return (
        <FlatList
          data={this.props.data.items}
          renderItem={({item}) => (<FavArticle {...item} showPage={this.props.showPage} />)}
          keyExtractor={(item, index) => ('article' + index)}
          onEndReached={() => {
            this.props.getFavArticlesFromApi(this.props.index, this.props.login.userData.urlName, this.props.data.offset)
          }}
          onEndReachedThreshold={0}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefreshHandler.bind(this)}
            />
          }
        />
      )
    } else {
      return (
        <Container style={styles.container}>
          <Button
            style={styles.btn}
            onPress={() => {
              Actions.login()
            }}
            block>
            <Text style={styles.btnText}>ログインする</Text>
          </Button>
        </Container>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  btn: {
    backgroundColor: '#f6b02c'
  },
  btnText: {
    color: '#fff'
  }
})
