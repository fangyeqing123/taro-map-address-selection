import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Map, CoverImage, ScrollView, Icon, Input  } from '@tarojs/components'
import './index.scss'
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js')
var qqmapsdk = new QQMapWX({
    key: '3DYBZ-MPJC2-L5KUS-CD6NL-F3TCF-TGFPY'
})
export default class Course extends Component {
    state = {
        detail: '',
        timer: null,
        map: {
            longitude: 113.76927057974245,
            latitude: 34.76670519464811,
            showLocation: true,
            iconPath: require('../../static/icon_position.png'),
            width: 40,
            height: 40,
            scale: 16,
            controls: [{
                id: 'map',
                iconPath: require('../../static/icon_position.png'),
                position: { left: 1200, top: 1200, width: 40, height: 40 },
                clickable: false
            }]
        },
        list: [],
        oftenList: [],
        address: {
            title: '',
            address: ''
        },
        checked: 0,
        scrollTop: 0,
        position: null,
        mapStatus: 1, // 控制选择地址时 地图不加载附近列表
        hasZb: false,
        latitude: '',
        longitude: ''
    }
    $instance = Taro.getCurrentInstance()
    componentWillMount() {
        Taro.setNavigationBarTitle({
            title: '搜索地址'
        })

        let data = this.$instance.router.params
        if (data.latitude && data.longitude) {
            this.latitude = data.latitude
            this.longitude = data.longitude
            this.detail = data.address
            this.hasZb = true
            this.setState({
                latitude: data.latitude,
                longitude: data.longitude,
                detail: data.address,
                hasZb: true
            }, () => {
                this.getAddress()
            })
        } else {
            this.getAddress()
        }
    }

    componentDidMount() { }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }

    //获取当前地址
    getAddress = () => {
        Taro.getLocation({
            type: 'gcj02',
            isHighAccuracy:true,
            success: (res) => {
                console.log(res)
                let map = this.state.map
                map.longitude = this.state.hasZb ? this.state.longitude : res.longitude
                map.latitude = this.state.hasZb ? this.state.latitude : res.latitude
                this.getWidthHeight(e => {
                    map.controls[0].position.top = e.height / 2 - 35
                    map.controls[0].position.left = e.width / 2 - 20
                    this.setState({
                        map: map,
                        position: {
                            longitude: this.state.hasZb ? this.state.longitude : res.longitude,
                            latitude: this.state.hasZb ? this.state.latitude : res.latitude
                        }
                    }, () => {
                        this.getAddressList(1)
                    })

                })
            },
        })
    }

    //获取地图高度
    getWidthHeight = (fn) => {
        var query = Taro.createSelectorQuery()
        query.select('#map').boundingClientRect()
        query.exec(res => {
            fn(res[0])
        })
    }

    //获取下方列表数据
    getAddressList = (s = 0) => {
        let position = this.state.position
        console.log(position)
        qqmapsdk.reverseGeocoder({
            location: {
                latitude: position.latitude,
                longitude: position.longitude
            },
            get_poi: 1,
            poi_options: "page_size=20;page_index=1",
            success: (e) => {
                if (s) {
                    e.result.pois[0].select = 1
                    this.setState({
                        list: e.result.pois,
                        address: e.result.pois[0],
                        checked: 0
                    })
                } else {
                    this.setState({
                        list: e.result.pois
                    })
                }
                setTimeout(() => {
                    console.log('************');
                    this.setState({
                        scrollTop: 1
                    })
                }, 1000)
            },
            fail: err => {
                console.log(err)
            }
        })
    }
     
    //地图移动时候触发事件
    mapChange = (e) => {
        let that = this
        console.log(this.state.mapStatus);
        clearTimeout(this.state.timer)
        this.state.timer = setTimeout(() => {
            if (e.type == 'end') {
                that.state.mapCtx = Taro.createMapContext('map')
                that.state.mapCtx.getCenterLocation({
                    success: res => {
                        console.log(res)
                        that.setState({
                            position: {
                                latitude: res.latitude,
                                longitude: res.longitude
                            }
                        }, () => {
                            if (that.state.mapStatus) { // 防止地图点击时 进行多次加载
                                that.getAddressList(1)
                            } else {
                                that.setState({
                                    mapStatus: 1
                                })
                            }
                        })

                    }
                })
            }
        }, 200)
    }

    //点击下方列表页设置地址
    bindAddress = (index) => {
        let list = this.state.list
        let map = this.state.map
        map.latitude = list[index].location.lat
        map.longitude = list[index].location.lng
        this.setState({
            map: map,
            checked: index,
            address: list[index],
            mapStatus: 0
        })
    }

    //点击跳转搜索页
    addressSearch = () => {
        Taro.navigateTo({
            url: '/pages/addressSearch/index'
        })
    }
    
    //确定最终地址
    submit = () => {
        let that = this
        let detail = that.state.detail || ''
        let address = that.state.address
        let a = {
            address: address.title + detail,
            lat: address.location.lat,
            lng: address.location.lng
        }
        console.log(address, a)
    }

    render() {
        const { detail, map, list, oftenList, address, checked, scrollTop, mapStatus } = this.state
        return (
            <View className="content">
                <View className='content'>
                    <View className='header bg-ff'>
                        <View className='row padding border-b font-26'>
                            <View className='col ellipsis-1'>
                                <View className='ellipsis-1'>
                                    <View className=''>
                                        <Text className='color'>[当前] </Text>{address.title}
                                    </View>
                                    <View className='color-99 ellipsis-1'>
                                        {address.address}
                                    </View>
                                </View>
                            </View>
                            <View className='padding-l' onClick={this.addressSearch}>
                                <Icon className='icon_search' type='search' size='22' color='#666' />
                            </View>
                        </View>
                        <View className='row padding font-26'>
                            <Input className='col' placeholder='补充详细地址：门牌号、楼房、房间号' v-model='detail' onConfirm={this.submit}></Input>
                            <View className='bg color-ff padding-lr btn border' onClick={this.submit}>确定</View>
                        </View>
                    </View>

                    <Map id='map' scale={map.scale}
                        showLocation={map.showLocation}
                        longitude={map.longitude}
                        latitude={map.latitude}
                        width={map.width}
                        height={map.height}
                        controls={map.controls}
                        markers={map.markers}
                        onRegionchange={this.mapChange}>
                        <CoverImage src={require('../../static/icon_position.png')} className="icon-img"></CoverImage>
                    </Map>

                    <View className='footer bg-ff font-26'>
                        <ScrollView scrollY className='scroll' scrollTop={scrollTop}>
                            <View className="">
                                {
                                    list.map((item, index) => {
                                        return (
                                            <View className='padding border-b position-r' key={index} onClick={this.bindAddress.bind(this, index)}>
                                                <View className='row'>{item.title}</View>
                                                <View className='row color-99'>{item.address}</View>
                                                {checked === index ? (<Icon type='success' color='#E74246' size='22' className='icon_circle' />) : null}
                                            </View>
                                        )
                                    })
                                }

                            </View>
                        </ScrollView>
                    </View>

                </View>
            </View >
        )
    }
}
