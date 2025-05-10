import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            component: () => import("@/views/Home.vue")
        },
        {
            path: "/auth",
            component: () => import("@/views/auth/Layout.vue"),
            meta: {
                unauth: true
            },
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
                    path: "signup",
                    component: () => import("@/views/auth/Signup.vue")
                }
            ]
        },
        {
            path: "/user/welcome",
            component: () => import("@/views/user/Welcome.vue"),
            meta: {
                auth: true
            }
        },
        {
            path: "/user",
            component: () => import("@/views/user/Layout.vue"),
            meta: {
                auth: true
            }
        },
    ]
})

router.beforeEach((to, from, next) => {
    if (to.meta.auth) {
        if (localStorage.getItem("session") === null) {
            next("/auth/login")
        } else {
            next()
        }
    } else if (to.meta.unauth) {
        if (localStorage.getItem("session") === null) {
            next()
        } else {
            next("/user")
        }
    } else {
        next()
    }
})

export default router
