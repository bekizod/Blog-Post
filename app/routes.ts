import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("profile", "routes/profile.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("blog", "routes/blog.tsx"),
] satisfies RouteConfig;
