from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class ItemType(enum.Enum):
    TEXTBOOK = "textbook"
    LECTURE_NOTES = "lecture_notes"
    CODING_RESOURCE = "coding_resource"
    COURSE_MATERIAL = "course_material"
    OTHER = "other"

class ListingStatus(enum.Enum):
    ACTIVE = "active"
    SOLD = "sold"
    ARCHIVED = "archived"

class MarketplaceListing(Base):
    __tablename__ = "marketplace_listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    item_type = Column(Enum(ItemType), nullable=False)
    price = Column(Float, nullable=False)
    condition = Column(String)  # new, like_new, good, fair, poor
    seller_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(ListingStatus), default=ListingStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    seller = relationship("User", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing")
    messages = relationship("MarketplaceMessage", back_populates="listing")

class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("marketplace_listings.id"))
    image_url = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    listing = relationship("MarketplaceListing", back_populates="images")

class MarketplaceMessage(Base):
    __tablename__ = "marketplace_messages"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("marketplace_listings.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    listing = relationship("MarketplaceListing", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

class NoteSummary(Base):
    __tablename__ = "note_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    original_file_name = Column(String, nullable=False)
    original_file_url = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    key_points = Column(Text)  # JSON string of key points
    course_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="note_summaries")

class QAPost(Base):
    __tablename__ = "qa_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    course_id = Column(String, nullable=True)
    karma_points = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="qa_posts")
    answers = relationship("QAAnswer", back_populates="post")

class QAAnswer(Base):
    __tablename__ = "qa_answers"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("qa_posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    karma_points = Column(Integer, default=0)
    is_accepted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    post = relationship("QAPost", back_populates="answers")
    user = relationship("User", back_populates="qa_answers") 