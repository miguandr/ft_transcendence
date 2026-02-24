from pydantic import BaseModel


class LegalDocumentResponse(BaseModel):
	key: str
	title: str
	content_html: str
	updated_at: str
