import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Icon, Input } from '@tarojs/components'
import './index.scss'
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js')
var qqmapsdk = new QQMapWX({
    key: '3DYBZ-MPJC2-L5KUS-CD6NL-F3TCF-TGFPY'
})
export default class AddressSearch extends Component {

    config = {
        navigationBarTitleText: '搜索地址'
    }

    state = {
        list: []
    }

    componentWillMount() { }

    componentDidMount() { }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }

    searchList = (n) => {
        qqmapsdk.getSuggestion({
            keyword: n,
            success: res => {
                console.log(res)
                this.setState({
                    list: res.data
                })
            },
            fail: err => {
                console.log(err)
            }
        })
    }

    bindInput = (e) => {
        let val = e.detail.value
        this.searchList(val)
    }

    bindConfirm = (e) => {
        let val = e.detail.value
        this.searchList(val)
    }

    address = (item) => {
        console.log(item);
        let pages = Taro.getCurrentPages()
        let prePages = pages[pages.length - 2].$component
        console.log(prePages);
        let list = prePages.state.list
        let map = prePages.state.map
        map.longitude = item.location.lng
        map.latitude = item.location.lat
        prePages.setState({
            address: item,
            list: list,
            map: map,
            position: {
                longitude: item.location.lng,
                latitude: item.location.lat
            },
            checked: 0
        }, () => {
            Taro.navigateBack({
                delta: 1
            })
        })
    }

    render() {
        const { list } = this.state
        return (
            <View>
                <View className='container'>
                    <View className='header bg-ff row padding'>
                        <Icon type='search' size='22' color='#999' />
                        <Input placeholder='请输入地址' className='col padding-l' onInput={this.bindInput} focus autoFocus onConfirm={this.bindConfirm}></Input>
                    </View>

                    <View className='bg-ff'>
                        <View className='padding color-99 font-26'>从下面列表中选择</View>
                        {
                            list.map((item, index) => {
                                return (
                                    <View className='padding border-t list position-r' key={index} onClick={this.address.bind(this, item)}>
                                        <View className='padding-b'>{item.title}</View>
                                        <View className='color-99'>{item.address}</View>
                                    </View>
                                )
                            })
                        }
                    </View>
                </View>
            </View>

        )
    }
}
