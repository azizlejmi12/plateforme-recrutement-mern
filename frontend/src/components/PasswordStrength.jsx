import { Check, X } from 'lucide-react'
import { passwordRules } from '../utils/passwordValidation'

function PasswordStrength({ password }) {
  // N'affiche rien tant que l'utilisateur n'a pas commencé à taper
  if (!password) return null

  return (
    <div className="mt-2 space-y-1">
      {passwordRules.map((rule) => {
        const isValid = rule.test(password)

        return (
          <div key={rule.label} className="flex items-center gap-2 text-xs">
            {isValid
              ? <Check size={14} className="text-success" />
              : <X size={14} className="text-gray-300" />
            }
            <span className={isValid ? 'text-success' : 'text-gray-400'}>
              {rule.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default PasswordStrength