import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import chaid from "chaid"

chai
  .use(chaiAsPromised)
  .use(chaid)
  .should()
