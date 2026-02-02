
#Funciones helper para resolver contexto #Dependencies “base” que otros endpoints usan siempre
#get_current_user() → lee el JWT, valida, devuelve el user (o 401)
#get_membership(user_id, org_id) → trae org_role + scrum_role 
# get resource????
#require_org_member 
#require_role_admin



#Helpers de autorización
#require_resource_permission(action, load_resource)
#require_resource_permission(action, loader)

#helpers tipo get_ticket(ticket_id) para obtener org_id desde recursos cuando el path no lo trae
#4) “Wirearlo” a un endpoint real (prueba de vida)
#5) Tests mínimos

from typing import Optional

def get_membership(user_id: str, org_id: str) -> Optional[dict]:
    if existe relacion
        return{
            "org_role":
            "scrum_role":
        }
    else
        return None