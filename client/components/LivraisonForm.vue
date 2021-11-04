<template>
  <div id="login">
    <div id="box">
      <label for="exampleInput1">Coordonées Bancaires :</label>
      <form v-on:submit.prevent="register">
        <div class="form-group">
          <label for="exampleInput1">Numero de carte :</label>
          <input type="email" class="form-control" id="exampleInput1" aria-describedby="emailHelp"
                 placeholder="Entrez le numero de carte" v-model="nCarte.input" v-bind:class="{'is-invalid': nCarte.invalid || invaliddata}"
                 required>
          <div class="invalid-feedback" v-if="!invaliddata">
            Le format ne correspond pas à une email
          </div>
        </div>
        <div class="form-group">
          <label for="exampleInput2">Nom du proprio :</label>
          <input type="email" class="form-control" id="exampleInput2" aria-describedby="emailHelp"
                 placeholder="Entrez le nom du proprio" v-model="proprio.input" v-bind:class="{'is-invalid': invaliddata}"
                 required>
          <div class="invalid-feedback" v-if="!invaliddata">
            Le format ne correspond pas à une email
          </div>
        </div>
        <div class="form-group">
          <label for="exampleInput3">Date d'expiration :</label>
          <input type="email" class="form-control" id="exampleInput3" aria-describedby="emailHelp"
                 placeholder="Entrez la date d'expiration" v-model="expDate.input" v-bind:class="{'is-invalid': invaliddata}"
                 required>
          <div class="invalid-feedback" v-if="!invaliddata">
            Le format ne correspond pas à une email
          </div>        </div>
        <div class="form-group">
          <label for="exampleInput4">CVC :</label>
          <input type="email" class="form-control" id="exampleInput4" aria-describedby="emailHelp"
                 placeholder="Entrez le CVC" v-model="CVC.input" v-bind:class="{'is-invalid': invaliddata}"
                 required>
          <div class="invalid-feedback" v-if="!invaliddata">
            Le format ne correspond pas à une email
          </div>
        </div>
        <div>
          <small id="emailHelp" class="form-text text-muted">Nous ne partagerons jamais votre coordonées bancaires.</small>
        </div>
        <button type="submit" class="btn btn-primary">Enregistrer</button>
      </form>
    </div>
  </div>
</template>

<script>
module.exports = {
  props: {
    invaliddata: {type: Boolean, default: false}
  },
  data() {
    return {
      nCarte: {input: '', invalid: false},
      proprio: {input: '', invalid: false},
      expDate: {input: '', invalid: false},
      CVC: {input: '', invalid: false},
    }
  },
  methods: {
    register() { //à terminer (regex comparaison)
      this.nCarte.invalid = !this.nCarte.input.match(/^(?=.*[0-9]).{16,}$/)
      this.proprio.invalid = !this.proprio.input.match(/^(?=.*[A-Z])$/)
      this.expDate.invalid = !this.password.input.match(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8,}$/)
      this.CVC.invalid = !this.CVC.input.match(/.*@.*\..{2,}/);
      // à modifier 
      let validForm = !this.password.invalid && !this.email.invalid && !this.confirmPassword.invalid
      if (validForm) {
        this.$emit('register', {email: this.email.input, passwd: this.password.input})
      }
    }
  }
}
</script>

<style scoped>
#login {
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
}

#box {
  display: block;
  margin: auto;
  min-width: 30%;
  padding: 15px;
}

form .form-group label {
  padding-top: 10px;
}

@media (min-width: 700px) {
  #box {
    border: 1px solid black;
    border-radius: 15px;
  }
}

h1, h2 {
  text-align: center;
}

h1 {
  font-size: 40px;
}

h2 {
  font-size: 18px;
}

form button {
  margin-top: 10px;
}
</style>
