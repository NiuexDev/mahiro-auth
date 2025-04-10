import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("@/views/HomeView.vue")
    },
    {
      path: "/auth",
      component: () => import("@/views/auth/Layout.vue"),
      children: [
        {
          path: "",
          redirect: "/auth/login"
        },
        {
          path: "login",
          component: () => import("@/views/auth/Login.vue")
        },
        {
          path: "register",
          component: () => import("@/views/auth/Register.vue")
        }
      ]
    },
    {
      path: "/user",
      component: () => import("@/views/user/Layout.vue")
    },
    {
      path: "/user/welcome",
      component: () => import("@/views/user/Welcome.vue")
    }
  ]
})

export default router
