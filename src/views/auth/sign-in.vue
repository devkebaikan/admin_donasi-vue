<template>
  <AuthLayout>
    <b-row class="justify-content-center">
      <b-col xl="5">
        <b-card no-body class="auth-card">
          <b-card-body class="px-3 py-5">
            <LogoBox
              customClass="mx-auto mb-4 text-center auth-logo"
              :smLogoHeight="30"
              :logoHeight="24"
              smLogoClass="me-1"
            />
            <h2 class="fw-bold text-center fs-18">Sign In</h2>
            <p class="text-muted text-center mt-1 mb-4">
              Enter your email address and password to access admin panel.
            </p>

            <div class="px-4">
              <b-form
                @submit.prevent="handleSignIn"
                class="authentication-form"
              >
                <!-- Error Alert -->
                <b-alert
                  v-model="showError"
                  variant="danger"
                  dismissible
                  class="mb-3"
                  @dismissed="error = ''"
                >
                  <i class="bx bx-error-circle me-2"></i>{{ error }}
                </b-alert>

                <!-- Success Alert -->
                <b-alert v-model="showSuccess" variant="success" class="mb-3">
                  <i class="bx bx-check-circle me-2"></i>Login successful!
                  Redirecting...
                </b-alert>
                <b-form-group label="Email" class="mb-3">
                  <b-form-input
                    type="email"
                    id="example-email"
                    name="example-email"
                    placeholder="Enter your Email"
                    v-model="v.email.$model"
                  />
                  <div v-if="v.email.$error" class="text-danger">
                    <span v-for="(err, idx) in v.email.$errors" :key="idx">
                      {{ err.$message }}
                    </span>
                  </div>
                </b-form-group>
                <div class="mb-3">
                  <!-- <router-link
                    :to="{ name: 'auth.reset-password' }"
                    class="float-end text-muted text-unline-dashed ms-1"
                    >Reset password</router-link
                  > -->
                  <label class="form-label" for="example-password"
                    >Password</label
                  >
                  <div class="position-relative">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      id="example-password"
                      class="form-control"
                      :class="{ 'is-invalid': v.password.$error }"
                      placeholder="Enter your password"
                      v-model="v.password.$model"
                      :disabled="isLoading"
                    />
                    <button
                      type="button"
                      class="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                      @click="togglePasswordVisibility"
                      :disabled="isLoading"
                    >
                      <i
                        :class="showPassword ? 'bx bx-hide' : 'bx bx-show'"
                      ></i>
                    </button>
                  </div>
                  <div v-if="v.password.$errors" class="text-danger">
                    <span v-for="(err, idx) in v.password.$errors" :key="idx">
                      {{ err.$message }}
                    </span>
                  </div>
                </div>
                <div class="mb-3">
                  <b-form-checkbox id="checkbox-signin">
                    Remember me
                  </b-form-checkbox>
                </div>

                <div class="mb-1 text-center d-grid">
                  <b-button
                    variant="primary"
                    type="submit"
                    :disabled="isLoading"
                  >
                    <span v-if="isLoading">
                      <span
                        class="spinner-border spinner-border-sm me-1"
                      ></span>
                      Signing in...
                    </span>
                    <span v-else>Sign In</span>
                  </b-button>
                </div>
              </b-form>

              <!-- <p class="mt-3 fw-semibold no-span">OR sign with</p>

              <div class="text-center">
                <a href="javascript:void(0);" class="btn btn-light shadow-none"
                  ><i class="bx bxl-google fs-20"></i></a
                >{{ " " }}
                <a href="javascript:void(0);" class="btn btn-light shadow-none"
                  ><i class="bx bxl-facebook fs-20"></i></a
                >{{ " " }}
                <a href="javascript:void(0);" class="btn btn-light shadow-none"
                  ><i class="bx bxl-github fs-20"></i
                ></a>
              </div> -->
            </div>
          </b-card-body>
        </b-card>
        <!-- <p class="mb-0 text-center">
          New here?
          <router-link
            :to="{ name: 'auth.sign-up' }"
            class="text-reset fw-bold ms-1"
            >Sign Up</router-link
          >
        </p> -->
      </b-col>
    </b-row>
  </AuthLayout>
</template>

<script setup lang="ts">
import AuthLayout from "@/layouts/AuthLayout.vue";

import { required, email } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";

import { ref, reactive, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import HttpClient from "@/helpers/http-client";
import { useAuthStore } from "@/stores/auth";

import type { AxiosResponse } from "axios";
import type { User } from "@/types/auth";

const credentials = reactive({
  email: "superadmin@example.com",
  password: "password123",
});

const vuelidateRules = computed(() => ({
  email: { required, email },
  password: { required },
}));

const v = useVuelidate(vuelidateRules, credentials);

const useAuth = useAuthStore();
const route = useRoute();
const router = useRouter();
const query = route.query;

const error = ref("");
const showError = computed({
  get: () => error.value.length > 0,
  set: (val) => {
    if (!val) error.value = "";
  },
});
const showSuccess = ref(false);
const isLoading = ref(false);
const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleSignIn = async () => {
  // Reset states
  error.value = "";
  showSuccess.value = false;

  const result = await v.value.$validate();

  if (!result) {
    return;
  }

  const payload = {
    email: credentials.email.trim(),
    password: credentials.password,
  };

  isLoading.value = true;

  try {
    const res: AxiosResponse<User> = await HttpClient.post(
      "/auth/login",
      payload,
    );

    // console.log("Login response:", res);

    // Validate response
    if (res.data?.access_token) {
      // Save session
      useAuth.saveSession({
        ...res.data,
        token: res.data.access_token,
      });

      // Show success message
      showSuccess.value = true;

      // Redirect after short delay
      setTimeout(() => {
        redirectUser();
      }, 500);
    } else {
      error.value = "Invalid response from server";
    }
  } catch (e: any) {
    console.error("Login error:", e);

    if (e.response) {
      console.log("Error response:", e.response.data);
      error.value =
        e.response.data?.message || "Login failed. Please try again.";
    } else if (e.request) {
      error.value = "Network error. Please check your connection.";
    } else {
      error.value = "An unexpected error occurred.";
    }
  } finally {
    isLoading.value = false;
  }
};

const redirectUser = () => {
  if (query.redirectedFrom) {
    return router.push(`${query.redirectedFrom}`);
  }
  return router.push("/");
};
</script>
