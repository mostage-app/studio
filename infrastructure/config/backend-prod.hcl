bucket         = "mostage-studio-terraform-state"
key            = "infrastructure/prod/terraform.tfstate"
region         = "eu-central-1"
dynamodb_table = "terraform-state-lock"
encrypt        = true

