# DEL me if I still exist





class BlockerBrief(BaseModel):
	id: UUID
	description: str
	status: BlockerStatus
	created_at: datetime

	model_config = ConfigDict(from_attributes=True)