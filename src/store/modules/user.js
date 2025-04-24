import { defineStore } from 'pinia'
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { isHttp, isEmpty } from "@/utils/validate"
import defAva from '@/assets/images/profile.jpg'

export const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      id: '',
      name: '',
      avatar: '',
      roles: [],
      permissions: []
    }),
    getters: {
      // 判断是否是管理员
      isAdmin: (state) => {
        return state.roles.includes('admin')
      }
    },
    actions: {
      // 登录
      login(userInfo) {
        const username = userInfo.username.trim()
        const password = userInfo.password
        const code = userInfo.code
        const uuid = userInfo.uuid
        return new Promise((resolve, reject) => {
          login(username, password, code, uuid).then(res => {
            setToken(res.token)
            this.token = res.token
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 获取用户信息
      getInfo() {
        return new Promise((resolve, reject) => {
          getInfo().then(res => {
            const user = res.user
            let avatar = user.avatar || ""
            if (!isHttp(avatar)) {
              avatar = (isEmpty(avatar)) ? defAva : import.meta.env.VITE_APP_BASE_API + avatar
            }
            if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              this.roles = res.roles
              this.permissions = res.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.id = user.userId
            this.name = user.userName
            this.avatar = avatar
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          try {
            logout().then(() => {
              this.token = ''
              this.roles = []
              this.permissions = []
              removeToken()
              resolve()
            }).catch(error => {
              console.error('登出失败:', error)
              // 即使后端接口失败，也清除本地状态
              this.token = ''
              this.roles = []
              this.permissions = []
              removeToken()
              resolve()
            })
          } catch (error) {
            console.error('登出过程发生错误:', error)
            // 发生错误时也清除本地状态
            this.token = ''
            this.roles = []
            this.permissions = []
            removeToken()
            resolve()
          }
        })
      }
    }
  })
