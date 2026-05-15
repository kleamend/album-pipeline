from fastapi import APIRouter
from ..services.providers.minimax import check_minimax_status
from ..schemas import ProviderStatusResponse, MinimaxStatus

router = APIRouter(tags=["providers"])


@router.get("/providers/status", response_model=ProviderStatusResponse)
def get_provider_status():
    from ..services.config_manager import load_config
    config = load_config()
    minimax_status = check_minimax_status()
    return ProviderStatusResponse(
        minimax=MinimaxStatus(**minimax_status),
        llm_key_configured=bool(config.get("llm_api_key")),
        netease="not_connected",
    )
