<template>
  <div id="login">
    <div id="box">
      <form class="forms">
          <div class="form-banc" v-on:submit.prevent="register">
            <h3>Coordonées Bancaires</h3>
            <div class="form-group">
              <label for="labelProp">Nom du proprio :</label>
              <input type="text" class="form-control" id="labelProp"
                     placeholder="Entrez le nom du proprio" v-model="proprio.input" v-bind:class="{'is-invalid': proprio.invalid || invaliddata}"
                     required>
              <div class="invalid-feedback" v-if="!invaliddata">
                Le format ne correspond pas à un nom : veuillez mettre une majuscule en début de nom
              </div>
            </div>
            <div class="form-group">
              <label for="labelNumCard">Numero de carte :</label>
              <input type="text" class="form-control" id="labelNumCard"
                     placeholder="Entrez le numero de carte" v-model="nCarte.input" v-bind:class="{'is-invalid': nCarte.invalid || invaliddata}"
                     required>
              <div class="invalid-feedback" v-if="!invaliddata">
                Le format ne correspond pas à un numéro de carte bancaire
              </div>
            </div>

            <div class="form-group">
              <label for="expDate">Date d'expiration :</label>
              <input type="date" class="form-control" id="expDate"
                     placeholder="Entrez la date d'expiration" v-model="expDate.input" v-bind:class="{'is-invalid': expDate.invalid || invaliddata}"
                     required>
              <div class="invalid-feedback" v-if="!invaliddata">
                Le format ne correspond pas à une date
              </div>        </div>
            <div class="form-group">
              <label for="cvcLabel">CVC :</label>
              <input type="text" class="form-control" id="cvcLabel"
                     placeholder="Entrez le CVC" v-model="CVC.input" v-bind:class="{'is-invalid': CVC.invalid || invaliddata}"
                     required>
              <div class="invalid-feedback" v-if="!invaliddata">
                Le format ne correspond pas à un numéro à trois chiffres
              </div>
            </div>
            <div>
              <small class="form-text text-muted">Nous ne partagerons jamais votre coordonées bancaires.</small>
            </div>
            <!--<button type="submit" class="btn btn-primary">Enregistrer</button>-->
          </div>
          <div class="form-ad" v-on:submit.prevent="register">
            <h3>Adresse de livraison</h3>
            <div class="form-group">
              <label for="adLabel">Adresse :</label>
              <input type="text" class="form-control" id="adLabel"
                     placeholder="n° de rue, rue, ville" v-model="street.input" v-bind:class="{'is-invalid': street.invalid || invaliddata}"
                     required>
              <div class="invalid-feedback" v-if="!invaliddata">
                Le format ne correspond pas à celui demandé
              </div>
            </div>
            <div class="form-group">
              <label for="cdPostLabel">Code postal :</label>
              <input type="text" class="form-control" id="cdPostLabel"
                     placeholder="Entrez votre code postal" v-model="codePost.input" v-bind:class="{'is-invalid': codePost.invalid || invaliddata}"
                     required>
              <div class="invalid-feedback" v-if="!invaliddata">
                Le format ne correspond pas à un code postal
              </div>
            </div>

            <div class="form-group">
              <label for="numApLabel">Numéro d'appartement :</label>
              <input type="text" class="form-control" id="numApLabel"
                     placeholder="Appartement" v-model="apart.input" v-bind:class="{'is-invalid': apart.invalid || invaliddata}"
                     required>
              <div class="invalid-feedback" v-if="!invaliddata">
                Le format ne correspond pas à un appartement
              </div>        </div>
            <div class="form-group">
              <label for="infCompLabel">Informations complémentaires :</label>
              <input type="text" class="form-control" id="infCompLabel"
                     placeholder="Entrez des informations complémentaires : code porte, numéro de téléphone etc." v-model="infPlus.input" v-bind:class="{'is-invalid': infPlus.invalid || invaliddata}"
                     required>
              <div class="invalid-feedback" v-if="!invaliddata">
                Le format ne correspond pas à un numéro à trois chiffres
              </div>
            </div>
            <div>
              <small id="emailHelp" class="form-text text-muted">Nous ne partagerons jamais votre coordonées bancaires.</small>
            </div>

          </div>
        <button v-on:click="register"  class="btn btn-primary">Enregistrer</button>
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
      street: {input: '', invalid: false},
      codePost: {input: '', invalid: false},
      apart: {input: '', invalid: false},
      infPlus: {input: '', invalid: false},
    }
  },
  methods: {
    register() { //à terminer (regex comparaison)
      this.proprio.invalid = !this.proprio.input.match(/^(?=.*[A-Z])(?=.*[a-z]).{1,30}$/)
      this.nCarte.invalid = !this.nCarte.input.match(/^(?=.*[0-9]).{16,16}$/)
      this.expDate.invalid = !this.expDate.input.match(/^.*$/)
      this.CVC.invalid = !this.CVC.input.match(/^(?=.*[0-9]).{3,3}$/);

      this.street.invalid = !this.street.input.match(/^[1-9]+ [0-9a-zA-Z èéà]+$/)
      this.codePost.invalid = !this.codePost.input.match(/^(?=.*[0-9]).{5,5}$/)
      this.apart.invalid = !this.apart.input.match(/^[0-9]+$/)
      this.infPlus.invalid = !this.infPlus.input.match(/^.*$/);
      // à modifier
      let validForm = this.proprio.invalid && this.nCarte.invalid && this.expDate.invalid && !this.CVC.invalid

     /* if (validForm) {
        this.$emit('register', {email: this.CVC.input, passwd: this.expDate.input})
      }*/
    },
    /*
    deliver() {
      let validForm = true
      if (validForm) {
        this.$emit('deliver', {email: this.CVC.input, passwd: this.expDate.input})
      }
    }*/
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
  padding: 25px;
  width: 50%;

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

h3{
  padding: 15px;
}

.forms{
  display: flex;
  flex-flow: row;
  justify-content: space-around;
  width: 100%;
}

</style>
