from fastapi import APIRouter
from ..services.providers.minimax import check_minimax_status
from ..schemas import ProviderStatusResponse

router = APIRouter(tags=["providers"])


@router.get("/providers/status", response_model=ProviderStatusResponse)
def get_provider_status():
    return ProviderStatusResponse(
        minimax=check_minimax_status(),
        netease="not_connected",
    )
