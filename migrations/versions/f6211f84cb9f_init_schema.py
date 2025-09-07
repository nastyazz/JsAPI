from alembic import op
import sqlalchemy as sa

revision = 'init_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('username', sa.String(50), nullable=False, unique=True),
        sa.Column('password', sa.String(100), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.func.now())
    )

    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id', ondelete="CASCADE")),
        sa.Column('title', sa.String(100), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('status', sa.String(20), server_default='pending'),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.func.now())
    )

    op.create_table(
        'comments',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('task_id', sa.Integer, sa.ForeignKey('tasks.id', ondelete="CASCADE")),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id', ondelete="CASCADE")),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.func.now())
    )

def downgrade():
    op.drop_table('comments')
    op.drop_table('tasks')
    op.drop_table('users')
