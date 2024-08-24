// Vuex Store
const store = new Vuex.Store({
  state: {
    cartItems: [],
    products: [],
    loading: true,
    errored: false
  },
  mutations: {
    ADD_NEW_ITEM: (state, item) => {
      item.isDeleting = false;
      item = { ...item, quantity: 1 };
      state.cartItems = [...state.cartItems, item];
    },
    UPDATE_CART: (state, item) => {
      let findIndex = state.cartItems.findIndex((x) => x.name == item.name);
      state.cartItems[findIndex].quantity++;
    },
    CHANGE_QUANTITY: (state, { index, increase }) => {
      if (increase) {
        state.cartItems[index].quantity++;
      } else {
        if (state.cartItems[index].quantity == 1) {
          state.cartItems.splice(index, 1);
        } else {
          state.cartItems[index].quantity--;
        }
      }
    },
    REMOVE_ALL: (state, index) => {
      state.cartItems.splice(index, 1);
    },
    LOAD_PRODUCTS: (state, products) => {
      state.products = products;
      state.loading = false;
    },
    ERRORED: (state, error) => {
      state.errored = true;
      console.error(error);
    }
  },
  actions: {
    removeAll: ({ commit }, index) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit("REMOVE_ALL", index);
          resolve();
        }, 700);
      });
    },
    retrieveProducts: ({ commit }) => {
      commit("LOAD_PRODUCTS", [
        {
          our_products: "Milks",
          price: 50.00,
          img: "milk",
          name: "Cow's Milk 500ml"
        },
        {
          our_products: "Milks",
          price: 100.00,
          img: "milk1",
          name: "Cow's milk 1ltr"
        },
        {
          our_products: "Yogurt",
          price: 60,
          img: "dahi",
          name: "Cow's yogurt 500ml"
        },
        {
          our_products: "Ghee",
          price: 900,
          img: "ghee",
          name: "Cow's Ghee 500gm"
        },
        {
          our_products: "Paneer",
          price: 950,
          img: "paneer",
          name: "Cow's Paneer 1kg"
        }
      ]);
    },
    addToCart: ({ commit, state }, product) => {
      let found = state.cartItems.some((el) => {
        return el.name === product.name;
      });
      if (!found) {
        commit("ADD_NEW_ITEM", product);
      } else {
        commit("UPDATE_CART", product);
      }
    }
  },
  getters: {
    cartCount: (state) => {
      if (state.cartItems.length === 0) {
        return "0";
      } else {
        return state.cartItems.reduce((a, b) => a + b.quantity, 0);
      }
    },
    cartTotal: (state) => {
      return state.cartItems
        .reduce((a, b) => a + b.price * b.quantity, 0)
        .toFixed(2);
    },
    itemCount: (state) => (index) => {
      if (index >= 0) {
        return state.cartItems[index].quantity;
      }
    },
    itemTotal: (state) => (index) => {
      if (state.cartItems[index]) {
        return state.cartItems[index].price * state.cartItems[index].quantity;
      }
    }
  }
});

// Vue filter
Vue.filter("capitalise", function(val) {
  return val.toUpperCase();
});

// Vue component: homepage
const Homepage = {
  render: function(createElement) {
    return createElement(
      "div",
      {
        class: "content"
      },
      [
        createElement(
          "div",
          {
            attrs: {
              style: "float:left"
            }
          },
          [
            createElement("h2", "Welcome to the store"),
            createElement("p", "Select a products name to get started")
          ]
        ),
        createElement("img", {
          class: "vue-logo",
          attrs: {
            src: ".//logo.png"
          }
        })
      ]
    );
  }
};

// Vue component: product
const Product = {
  template: "#product",
  data() {
    return {
      product: {
        name: this.name,
        price: this.price
      }
    };
  },
  props: {
    name: String,
    img: String,
    price: Number
  },
  methods: {
    ...Vuex.mapMutations(["ADD_NEW_ITEM", "UPDATE_CART"]),
    ...Vuex.mapActions(["addToCart"]),
    goToProduct() {
      router.push({
        name: "product-detail",
        params: { product: this.slashedName }
      });
    }
  },
  computed: {
    ...Vuex.mapState(["cartItems"]),
    ...Vuex.mapGetters(["itemCount"]),
    formatPrice() {
      return this.price.toFixed(2);
    },
    itemIndex() {
      return this.cartItems.findIndex((x) => x.name == this.name);
    },
    slashedName() {
      return this.name.replace(/\s+/g, "-").toLowerCase();
    }
  }
};

// Vue component: our_products
const our_products = {
  template: "#our_products",
  components: {
    product: Product
  },
  computed: {
    ...Vuex.mapState(["products", "loading", "errored"]),
    filteredProducts() {
      return this.products.filter(
        (x) => x.our_products.toLowerCase() == this.$route.params.our_products
      );
    }
  }
};

// Vue component: product-detail
const ProductDetail = {
  template: "#product-detail",
  data() {
    return {
      lorem: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec posuere tortor ac sapien iaculis, vitae iaculis nunc iaculis. Mauris justo nisi, tempor venenatis felis vel, elementum venenatis mi. Morbi in dolor vehicula, sollicitudin ante non, eleifend tellus. Nunc mollis tortor quis sapien aliquet porttitor. Duis eu turpis vel sapien tristique sodales. Ut quis risus sed dui sagittis ultricies vel eu felis. Donec in cursus tortor, vitae vehicula nisl."
    };
  },
  methods: {
    ...Vuex.mapActions(["addToCart"])
  },
  computed: {
    ...Vuex.mapState(["products", "cartItems"]),
    ...Vuex.mapGetters(["itemCount"]),
    product() {
      let findProduct = this.products.filter(
        (x) => x.name == this.formattedProduct
      );
      return findProduct[0];
    },
    formattedProduct() {
      let removeSlash = this.$route.params.product.replace(/-/g, " ");
      return removeSlash.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    },
    productPayload() {
      return {
        name: this.product.name,
        price: this.product.price
      };
    },
    itemIndex() {
      return this.cartItems.findIndex((x) => x.name == this.product.name);
    }
  }
};

// Vue Router
Vue.use(VueRouter);
const router = new VueRouter({
  routes: [
    {
      path: "/",
      name: "homepage",
      component: Homepage
    },
    {
      path: "/our_products/:our_products",
      name: "our_products",
      component: our_products,
      props: true
    },
    {
      path: "/product/:product",
      name: "product-detail",
      component: ProductDetail,
      props: true
    }
  ]
});

// Vue instance
new Vue({
  el: "#app",
  router,
  store,
  name: "app",
  data() {
    return {
      basketIsShown: false,
      showModal: false,
      item: ""
    };
  },
  filters: {
    currency: (price) => {
      return parseFloat(price).toFixed(2);
    }
  },
  methods: {
    ...Vuex.mapMutations(["CHANGE_QUANTITY"]),
    ...Vuex.mapActions(["removeAll", "retrieveProducts"]),
    showBasket: function() {
      this.basketIsShown = !this.basketIsShown;
    },
    changeQuantity: function(index, increase) {
      this.CHANGE_QUANTITY({
        index,
        increase
      });
    },
    removeAllItems: function(item, index) {
      this.$store.state.cartItems[index].isDeleting = true;
      this.removeAll(index);
    },
    afterLeave() {
      window.scroll(0, 0);
    }
  },
  computed: {
    ...Vuex.mapState(["cartItems", "products", "loading", "errored"]),
    ...Vuex.mapGetters(["cartCount", "cartTotal", "itemTotal"]),
    our_productss() {
      let allour_productss = this.products.map((x) => x.our_products.toLowerCase());
      return [...new Set(allour_productss)];
    }
  },
  mounted() {
    this.retrieveProducts();
  }
});