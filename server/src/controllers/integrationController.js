import Integration from '../models/Integration.js';
import integrationService from '../services/integrationService.js';

/**
 * @desc    Get all connected integrations for current user
 * @route   GET /api/integrations
 * @access  Private
 */
export const getIntegrations = async (req, res, next) => {
  try {
    const integrations = await Integration.find({ owner: req.user._id }).lean();

    // Sanitize credentials so raw encrypted strings are not exposed
    const sanitized = integrations.map((item) => ({
      _id: item._id,
      provider: item.provider,
      status: item.status,
      metadata: item.metadata,
      hasAccessToken: !!item.credentials?.accessToken,
      hasWebhook: !!item.credentials?.webhookUrl,
      scopes: item.credentials?.scopes || [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    res.status(200).json({
      success: true,
      integrations: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Google OAuth consent flow URL
 * @route   GET /api/integrations/google/auth
 * @access  Private
 */
export const getGoogleAuthUrl = async (req, res, next) => {
  try {
    const authUrl = integrationService.generateGoogleAuthUrl(req.user._id);
    res.status(200).json({
      success: true,
      authUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle Google OAuth callback
 * @route   POST /api/integrations/google/callback
 * @access  Private
 */
export const handleGoogleCallback = async (req, res, next) => {
  try {
    const { code, email } = req.body;
    const integration = await integrationService.handleGoogleCallback(
      code || 'mock_code',
      req.user._id,
      email || req.user.email
    );

    res.status(200).json({
      success: true,
      message: 'Google Workspace connected successfully',
      integration: {
        _id: integration._id,
        provider: integration.provider,
        status: integration.status,
        metadata: integration.metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Connect Slack incoming webhook
 * @route   POST /api/integrations/slack
 * @access  Private
 */
export const connectSlack = async (req, res, next) => {
  try {
    const { webhookUrl, channelName, workspaceName } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Slack webhook URL',
        code: 'WEBHOOK_REQUIRED',
      });
    }

    const integration = await integrationService.saveSlackIntegration(
      req.user._id,
      webhookUrl,
      channelName,
      workspaceName
    );

    res.status(200).json({
      success: true,
      message: 'Slack webhook integration connected successfully',
      integration: {
        _id: integration._id,
        provider: integration.provider,
        status: integration.status,
        metadata: integration.metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Connect Discord webhook
 * @route   POST /api/integrations/discord
 * @access  Private
 */
export const connectDiscord = async (req, res, next) => {
  try {
    const { webhookUrl, channelName, workspaceName } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Discord webhook URL',
        code: 'WEBHOOK_REQUIRED',
      });
    }

    const integration = await integrationService.saveDiscordIntegration(
      req.user._id,
      webhookUrl,
      channelName,
      workspaceName
    );

    res.status(200).json({
      success: true,
      message: 'Discord webhook integration connected successfully',
      integration: {
        _id: integration._id,
        provider: integration.provider,
        status: integration.status,
        metadata: integration.metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Test an active integration connection
 * @route   POST /api/integrations/test/:id
 * @access  Private
 */
export const testIntegrationHandler = async (req, res, next) => {
  try {
    const result = await integrationService.testIntegration(req.params.id, req.user._id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Revoke and delete an integration
 * @route   DELETE /api/integrations/:id
 * @access  Private
 */
export const deleteIntegration = async (req, res, next) => {
  try {
    const integration = await Integration.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found',
        code: 'INTEGRATION_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Integration revoked and removed successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getIntegrations,
  getGoogleAuthUrl,
  handleGoogleCallback,
  connectSlack,
  connectDiscord,
  testIntegrationHandler,
  deleteIntegration,
};
