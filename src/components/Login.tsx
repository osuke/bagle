import * as React from 'react'
import { StyleSheet } from 'react-native'
import {
  View,
  Text
} from 'native-base'
import { Actions } from 'react-native-router-flux'
import {
  TEXT_COLOR_PRIMARY,
  BACKGROUND_COLOR_GRAY
} from '../constants/styles'
import Btn from './Btn'

const Login: React.SFC<{}> = () => (
  <View style={styles.container}>
    <Text style={styles.text}>この機能を使用するためにはログインが必要です</Text>
    <View style={styles.submit}>
      <Btn
        onPress={Actions.login}
      >
        ログインする
      </Btn>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    backgroundColor: BACKGROUND_COLOR_GRAY,
    flex: 1
  },
  text: {
    fontSize: 14,
    color: TEXT_COLOR_PRIMARY,
    textAlign: 'center'
  },
  submit: {
    paddingTop: 28,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

export default Login
