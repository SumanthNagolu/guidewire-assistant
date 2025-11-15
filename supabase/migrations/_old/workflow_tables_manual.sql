
      CREATE TABLE IF NOT EXISTS workflow_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        category TEXT CHECK (category IN ('recruiting', 'bench_sales', 'training', 'sales', 'talent_acquisition', 'custom')),
        stages JSONB NOT NULL DEFAULT '[]'::jsonb,
        transitions JSONB NOT NULL DEFAULT '[]'::jsonb,
        designer_data JSONB DEFAULT '{}'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        is_system BOOLEAN DEFAULT FALSE,
        version INTEGER DEFAULT 1,
        created_by UUID REFERENCES auth.users(id),
        pod_id UUID REFERENCES pods(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    ;


      CREATE TABLE IF NOT EXISTS workflow_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID REFERENCES workflow_templates(id),
        name TEXT NOT NULL,
        description TEXT,
        status TEXT CHECK (status IN ('active', 'completed', 'cancelled', 'paused')) DEFAULT 'active',
        current_stage TEXT,
        pod_id UUID REFERENCES pods(id),
        job_id UUID REFERENCES jobs(id),
        candidate_id UUID REFERENCES candidates(id),
        instance_type TEXT CHECK (instance_type IN ('job', 'candidate', 'training', 'custom')),
        data JSONB DEFAULT '{}'::jsonb,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    ;


      CREATE TABLE IF NOT EXISTS workflow_stage_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
        stage_name TEXT NOT NULL,
        entered_at TIMESTAMPTZ DEFAULT NOW(),
        exited_at TIMESTAMPTZ,
        duration_minutes INTEGER,
        outcome TEXT,
        notes TEXT,
        performed_by UUID REFERENCES auth.users(id),
        data JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    ;


      CREATE TABLE IF NOT EXISTS sourcing_quotas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pod_id UUID REFERENCES pods(id),
        user_id UUID REFERENCES auth.users(id),
        job_id UUID REFERENCES jobs(id),
        quota_type TEXT CHECK (quota_type IN ('daily', 'weekly', 'monthly', 'job')),
        target_count INTEGER NOT NULL,
        current_count INTEGER DEFAULT 0,
        period_start DATE,
        period_end DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    ;


      CREATE TABLE IF NOT EXISTS production_line_view (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID REFERENCES workflow_instances(id),
        stage_name TEXT,
        items_count INTEGER DEFAULT 0,
        average_time_hours DECIMAL(10,2),
        bottleneck_score DECIMAL(5,2),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    ;


      CREATE TABLE IF NOT EXISTS bottleneck_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID REFERENCES workflow_instances(id),
        stage_name TEXT,
        alert_type TEXT CHECK (alert_type IN ('slow', 'blocked', 'overload')),
        status TEXT CHECK (status IN ('open', 'resolved', 'ignored')) DEFAULT 'open',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      )
    ;


      CREATE TABLE IF NOT EXISTS resume_database (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID REFERENCES candidates(id),
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        current_title TEXT,
        years_experience INTEGER,
        skills TEXT[],
        education JSONB DEFAULT '[]'::jsonb,
        work_experience JSONB DEFAULT '[]'::jsonb,
        resume_text TEXT,
        resume_embedding VECTOR(1536),
        source TEXT,
        sourced_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    ;