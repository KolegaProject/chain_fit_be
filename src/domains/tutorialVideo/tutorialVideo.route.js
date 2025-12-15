import BaseRoutes from "../../base_classes/base-route.js";
import tryCatch from "../../utils/tryCatcher.js";
import tutorialVideoController from "./tutorialVideo.controller.js";
import validateCredentials from "../../middlewares/validate-credentials-middleware.js";
import authTokenMiddleware from "../../middlewares/auth-token-middleware.js";
import {createTutorialVideo, updateTutorialVideo, queryTutorialVideo } from "./tutorialVideo.schema.js";

class TutorialVideoRoutes extends BaseRoutes {
  routes() {
    // 1. Create Video
    this.router.post('/',
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(['OWNER']),
      validateCredentials(createTutorialVideo),
      tryCatch(tutorialVideoController.create)
    );

    // 2. Get All Videos
    // Bisa filter by ?equipmentId=123
    this.router.get('/',
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(['OWNER' , 'MEMBER']),
      validateCredentials(queryTutorialVideo),
      tryCatch(tutorialVideoController.findAll)
    );

    // 3. Get Detail Video
    this.router.get('/:id',
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(['OWNER', 'MEMBER']),
      tryCatch(tutorialVideoController.findOne)
    );

    // 4. Update Video
    this.router.patch('/:id',
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(['OWNER']),
      validateCredentials(updateTutorialVideo),
      tryCatch(tutorialVideoController.update)
    );

    // 5. Delete Video
    this.router.delete('/:id',
      authTokenMiddleware.authenticate,
      authTokenMiddleware.authorizeUser(['OWNER']),
      tryCatch(tutorialVideoController.delete)
    );
  }
}

export default new TutorialVideoRoutes().router;