import tutorialVideoService from "./tutorialVideo.service.js";
import { createdResponse, successResponse } from "../../utils/response.js";

class TutorialVideoController {
  
  async create(req, res) {
    const result = await tutorialVideoService.create(req.user.id, req.body);
    return createdResponse(res, result);
  }

  async findAll(req, res) {
    const result = await tutorialVideoService.findAll(req.user, req.query);
    return successResponse(res, result);
  }

  async findOne(req, res) {
    const { id } = req.params;
    const result = await tutorialVideoService.findOne(req.user, id);
    return successResponse(res, result);
  }

  async update(req, res) {
    const { id } = req.params;
    const result = await tutorialVideoService.update(req.user.id, id, req.body);
    return successResponse(res, result);
  }

  async delete(req, res) {
    const { id } = req.params;
    await tutorialVideoService.delete(req.user.id, id);
    return successResponse(res, 'Video tutorial berhasil dihapus');
  }
}

export default new TutorialVideoController();